package com.example.product_service.kafkaconsumer;

import com.example.product_service.repository.ProductR2DBCRepository;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.Disposable;
import reactor.core.publisher.Flux;
import reactor.kafka.receiver.KafkaReceiver;
import reactor.kafka.receiver.ReceiverRecord;
import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.apache.kafka.clients.producer.ProducerRecord;
import reactor.core.publisher.Mono;
import reactor.kafka.sender.KafkaSender;
import reactor.kafka.sender.SenderRecord;
import reactor.kafka.sender.SenderResult;
import reactor.util.retry.Retry;
import java.util.*;


@Component
@RequiredArgsConstructor
public class ReactiveSalesEventConsumer {

    private final KafkaReceiver<String, String> kafkaReceiver;
    private final KafkaSender<String, String> kafkaSender; // for DLQ
    private final ProductR2DBCRepository repo;

    private Disposable subscription;

    private static final int BATCH_SIZE = 500;
    private static final Duration BATCH_TIMEOUT = Duration.ofSeconds(60);
    private static final int DB_PARALLELISM = 8;
    private static final String DLQ_TOPIC = "product-sales-dlq";
    private static final int DB_RETRY_TIMES = 3;

    @PostConstruct
    public void start() {
        Flux<ReceiverRecord<String, String>> inbound = kafkaReceiver.receive();

        subscription = inbound
                .bufferTimeout(BATCH_SIZE, BATCH_TIMEOUT)
                .filter(batch -> !batch.isEmpty())
                .flatMap(this::processBatch, 4)
                .doOnError(err -> {
                    System.err.println("ReactiveSalesEventConsumer - stream error: " + err.getMessage());
                    err.printStackTrace();
                })
                .subscribe();
    }

    private Mono<Void> processBatch(List<ReceiverRecord<String, String>> batch) {
        // map productId -> total qty
        Map<UUID, Long> agg = new HashMap<>();
        // map productId -> list of records that contributed (to ack or DLQ later)
        Map<UUID, List<ReceiverRecord<String, String>>> recordsById = new HashMap<>();

        List<ReceiverRecord<String, String>> parsingFailedRecords = new ArrayList<>();

        for (ReceiverRecord<String, String> r : batch) {
            try {
                String v = r.value();
                String[] parts = v.split(":");
                UUID id = UUID.fromString(parts[0].trim());
                long qty = Long.parseLong(parts[1].trim());
                agg.merge(id, qty, Long::sum);

                recordsById.computeIfAbsent(id, k -> new ArrayList<>()).add(r);
            } catch (Exception ex) {
                // parsing failed -> queue to DLQ (will ack after DLQ send)
                parsingFailedRecords.add(r);
            }
        }

        // 1) handle parsing failures: send to DLQ and ack them
        Mono<Void> handleParsingFails = Flux.fromIterable(parsingFailedRecords)
                .flatMap(r -> sendToDlq(r, "PARSE_ERROR"))
                .then()
                .doOnSuccess(v -> parsingFailedRecords.forEach(r -> r.receiverOffset().acknowledge()));

        if (agg.isEmpty()) {
            return handleParsingFails;
        }

        // 2) perform DB updates for each agg entry with retry; track successes/failures
        return Flux.fromIterable(agg.entrySet())
                .flatMap(entry -> {
                    UUID productId = entry.getKey();
                    long totalQty = entry.getValue();

                    return repo.incrementSalesCount(productId, totalQty)
                            .retryWhen(Retry.backoff(DB_RETRY_TIMES, Duration.ofSeconds(1))
                                    .maxBackoff(Duration.ofSeconds(5)))
                            .then(Mono.just(productId)) // success -> return productId
                            .onErrorResume(err -> {
                                // on persistent failure, send all contributing records to DLQ, then return empty
                                List<ReceiverRecord<String, String>> related = recordsById.getOrDefault(productId, Collections.emptyList());
                                return Flux.fromIterable(related)
                                        .flatMap(r -> sendToDlq(r, "DB_UPDATE_ERROR: " + err.getMessage()))
                                        .then(Mono.empty());
                            });
                }, DB_PARALLELISM)
                .collectList()
                .doOnSuccess(processedProductIds -> {
                    // ack offsets for successful productIds
                    Set<UUID> processed = new HashSet<>(processedProductIds);
                    // for each processed product id, ack all its contributing records
                    processed.forEach(id -> {
                        List<ReceiverRecord<String, String>> recs = recordsById.getOrDefault(id, Collections.emptyList());
                        recs.forEach(r -> r.receiverOffset().acknowledge());
                    });
                })
                .then(handleParsingFails) // ensure parsing-fails were handled as well
                .onErrorResume(err -> {
                    // last-resort: if unexpected error happens, log and push whole batch to DLQ (choose policy)
                    System.err.println("Unexpected error processing batch: " + err.getMessage());
                    // push raw values to DLQ to avoid blocking stream
                    return Flux.fromIterable(batch)
                            .flatMap(r -> sendToDlq(r, "BATCH_FATAL_ERROR: " + err.getMessage()))
                            .then();
                });
    }

    private Mono<SenderResult<Void>> sendToDlq(ReceiverRecord<String, String> r, String reason) {
        // prepare a JSON-like payload containing original metadata + reason
        String payload = String.format("{\"topic\":\"%s\",\"partition\":%d,\"offset\":%d,\"key\":%s,\"value\":\"%s\",\"reason\":\"%s\"}",
                r.topic(),
                r.partition(),
                r.offset(),
                r.key() == null ? "null" : r.key(),
                escapeForJson(r.value()),
                reason.replace("\"", "\\\""));

        ProducerRecord<String, String> producerRecord = new ProducerRecord<>(DLQ_TOPIC, r.key(), payload);
        SenderRecord<String, String, Void> senderRecord = SenderRecord.create(producerRecord, null);
        return kafkaSender.send(Mono.just(senderRecord)).next();
    }

    private static String escapeForJson(String s) {
        if (s == null) return "";
        return s.replace("\"", "\\\"").replace("\n", "\\n");
    }

    @PreDestroy
    public void stop() {
        if (subscription != null && !subscription.isDisposed()) {
            subscription.dispose();
        }
    }
}
