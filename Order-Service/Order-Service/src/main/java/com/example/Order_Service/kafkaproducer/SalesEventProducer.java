package com.example.Order_Service.kafkaproducer;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;
import reactor.kafka.sender.KafkaSender;
import reactor.kafka.sender.SenderRecord;
import reactor.kafka.sender.SenderResult;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class SalesEventProducer {

    private final KafkaSender<String, String> kafkaSender;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String TOPIC = "product-sales";

    public Mono<SenderResult<Void>> sendSaleEvent(UUID eventId,
                                                  UUID orderId,
                                                  UUID productId,
                                                  long qty) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("eventId", eventId.toString());
        payload.put("orderId", orderId.toString());
        payload.put("productId", productId.toString());
        payload.put("qty", qty);
        payload.put("ts", Instant.now().toString());

        String json;
        try {
            json = objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException e) {
            return Mono.error(new RuntimeException("Failed to serialize sale event", e));
        }

        // key = productId để đảm bảo same-product -> same-partition (ordering/aggregation dễ hơn)
        ProducerRecord<String, String> record = new ProducerRecord<>(TOPIC, productId.toString(), json);
        SenderRecord<String, String, Void> senderRecord = SenderRecord.create(record, null);

        // send trả về Flux<SenderResult>, .next() lấy phần tử đầu (Mono)
        return kafkaSender.send(Mono.just(senderRecord)).next();
    }
}
