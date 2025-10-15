package com.example.Payment_Service.service.serviceimpl;

import com.example.Payment_Service.config.MomoProperties;
import com.example.Payment_Service.dto.CreatePaymentDto;
import com.example.Payment_Service.entity.Payment;
import com.example.Payment_Service.ennum.PaymentStatus;
import com.example.Payment_Service.mapper.PaymentMapper;
import com.example.Payment_Service.repository.PaymentRepository;
import com.example.Payment_Service.service.PaymentService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepo;
    private final MomoProperties momoProperties;
    private final ApplicationEventPublisher eventPublisher;
    private final PaymentMapper paymentMapper;
    private final WebClient momoWebClient;
    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final Logger logger = LoggerFactory.getLogger(PaymentServiceImpl.class);

    @Override
    public Mono<Map<String, Object>> createPaymentFromExternal(CreatePaymentDto dto) {
        logger.info("createPaymentFromExternal -> received dto: orderId={} amount={} provider={}", dto.getOrderId(), dto.getAmount(), dto.getProvider());
        Payment p = paymentMapper.toEntity(dto);

        // ensure idempotency key present - if client didn't provide generate one
        if (p.getIdempotencyKey() == null || p.getIdempotencyKey().isBlank()) {
            p.setIdempotencyKey(UUID.randomUUID().toString());
            logger.debug("createPaymentFromExternal -> generated idempotencyKey={}", p.getIdempotencyKey());
        } else {
            logger.debug("createPaymentFromExternal -> using client idempotencyKey={}", p.getIdempotencyKey());
        }

        p.setParentPaymentId(dto.getParentPaymentId());
        p.setPaymentType(dto.getPaymentType());
        p.setAmountTotal(dto.getAmountTotal());
        p.setAmountCaptured(BigDecimal.ZERO);
        p.setAmountRefunded(BigDecimal.ZERO);
        p.setFeeTotal(dto.getFeeTotal());
        p.setProviderPayloadHash(dto.getProviderPayloadHash());
        p.setProvider(dto.getProvider());

        // Save initial payment record. If duplicate idempotency -> fetch existing and continue.
        return paymentRepo.save(p)
                .onErrorResume(e -> {
                    // guard: Spring may wrap it differently so check message too
                    boolean dup = (e instanceof DuplicateKeyException) || (e.getMessage() != null && e.getMessage().contains("ux_payments_idempotency_key"));
                    if (dup) {
                        logger.warn("Duplicate idempotency key on initial save: idempotencyKey={} -> fetching existing record", p.getIdempotencyKey());
                        return paymentRepo.findByIdempotencyKey(p.getIdempotencyKey())
                                .switchIfEmpty(Mono.error(new IllegalStateException("Duplicate key but existing payment not found: " + p.getIdempotencyKey())));
                    }
                    logger.error("Error saving initial payment", e);
                    return Mono.error(e);
                })
                .flatMap(saved -> {
                    logger.info("Payment saved (or existing found) id={} idempotencyKey={} status={}", saved.getId(), saved.getIdempotencyKey(), saved.getStatus());
                    String amountStr = saved.getAmount() == null ? "0" : saved.getAmount().setScale(0, java.math.RoundingMode.DOWN).toPlainString();
                    return new MomoClient(momoProperties, momoWebClient) // use existing bean if available; constructor params are injected in Spring context
                            .createPaymentLink(null, amountStr, saved.getId().toString(), momoProperties.getCallbackUrl(), dto.getPartnerClientId())
                            .flatMap(momoResp -> {
                                String txId = (String) momoResp.get("txId");
                                String qr = momoResp.get("qrCodeUrl") != null ? momoResp.get("qrCodeUrl").toString() : (String) momoResp.get("payUrl");
                                Object expires = momoResp.get("expiresAt");
                                Instant expiresAt = expires instanceof Instant ? (Instant) expires : null;

                                saved.setMomoReference(txId);
                                saved.setQrCodeUrl(qr);
                                saved.setUpdatedAt(Instant.now());

                                logger.info("Updating payment with momoReference={} qrPresent={} paymentId={}", txId, qr != null, saved.getId());

                                return paymentRepo.save(saved)
                                        .onErrorResume(e -> {
                                            boolean dup = (e instanceof DuplicateKeyException) || (e.getMessage() != null && e.getMessage().contains("ux_payments_idempotency_key"));
                                            if (dup) {
                                                logger.warn("Duplicate idempotency key when updating payment (unexpected) idempotencyKey={} -> fetching existing", saved.getIdempotencyKey());
                                                return paymentRepo.findByIdempotencyKey(saved.getIdempotencyKey())
                                                        .switchIfEmpty(Mono.error(new IllegalStateException("Duplicate on update but not found: " + saved.getIdempotencyKey())));
                                            }
                                            logger.error("Error saving updated payment", e);
                                            return Mono.error(e);
                                        })
                                        .map(updated -> {
                                            logger.info("Payment updated savedId={} momoRef={}", updated.getId(), updated.getMomoReference());

                                            Map<String, Object> result = new HashMap<>();
                                            result.put("paymentId", updated.getId());
                                            if (updated.getMomoReference() != null) result.put("momoReference", updated.getMomoReference());
                                            if (updated.getQrCodeUrl() != null) result.put("qrCodeUrl", updated.getQrCodeUrl());
                                            if (expiresAt != null) result.put("expiresAt", expiresAt);
                                            return result;
                                        });

                            });
                });
    }


    @Override
    public Mono<Void> processWebhook(String body) {
        logger.info("processWebhook -> incoming payload length={}", body == null ? 0 : body.length());
        JsonNode root;
        try {
            root = objectMapper.readTree(body);
        } catch (Exception e) {
            logger.error("processWebhook -> invalid webhook payload", e);
            return Mono.error(new IllegalArgumentException("invalid webhook payload", e));
        }

        String txId = extractFirstNonNull(
                safeText(root, "transactionId"),
                safeText(root, "referenceId"),
                safeText(root, "xReferenceId"),
                safeText(root, "txId"),
                safeText(root, "momoReference")
        );

        String externalId = extractFirstNonNull(
                safeText(root, "externalId"),
                safeText(root, "orderId"),
                safeText(root, "merchantOrderId")
        );

        String rawStatus = extractFirstNonNull(
                safeText(root, "status"),
                safeText(root, "paymentStatus"),
                safeText(root, "result")
        );

        logger.debug("processWebhook -> txId={} externalId={} status={}", txId, externalId, rawStatus);

        PaymentStatus newStatus = mapProviderStatusToPaymentStatus(rawStatus);

        Mono<Payment> paymentMono;
        if (StringUtils.hasText(txId)) {
            paymentMono = paymentRepo.findByMomoReference(txId);
        } else if (StringUtils.hasText(externalId)) {
            paymentMono = paymentRepo.findByExternalId(externalId);
        } else {
            logger.warn("processWebhook -> no txId or externalId found in payload");
            paymentMono = Mono.empty();
        }

        return paymentMono.switchIfEmpty(Mono.defer(() -> {
                    logger.warn("processWebhook -> payment not found for txId={} externalId={}", txId, externalId);
                    return Mono.empty();
                }))
                .flatMap(payment -> {
                    logger.info("processWebhook -> found payment id={} currentStatus={} -> newStatus={}", payment.getId(), payment.getStatus(), newStatus);
                    if (payment.getStatus() != null && payment.getStatus().equals(newStatus)) {
                        payment.setWebhookAttempts(safeInc(payment.getWebhookAttempts()));
                        payment.setWebhookReceivedAt(Instant.now());
                        payment.setWebhookPayload(truncate(body, 2000));
                        return paymentRepo.save(payment)
                                .doOnSuccess(saved -> logger.debug("processWebhook -> updated webhookAttempts={} for paymentId={}", saved.getWebhookAttempts(), saved.getId()))
                                .then();
                    }

                    payment.setStatus(newStatus);
                    payment.setWebhookVerified(true);
                    if (StringUtils.hasText(txId)) payment.setMomoReference(txId);
                    if (StringUtils.hasText(externalId)) payment.setExternalId(externalId);
                    payment.setWebhookAttempts(safeInc(payment.getWebhookAttempts()));
                    payment.setWebhookReceivedAt(Instant.now());
                    payment.setWebhookPayload(truncate(body, 2000));
                    payment.setUpdatedAt(Instant.now());

                    return paymentRepo.save(payment)
                            .doOnSuccess(saved -> logger.info("processWebhook -> payment {} status updated to {}", saved.getId(), saved.getStatus()))
                            .flatMap(saved -> {
                                // publish event and notify order service (omitted)
                                logger.debug("processWebhook -> would publish event for paymentId={}", saved.getId());
                                return Mono.empty();
                            });
                })
                .then();
    }

    // --- helper methods ---

    private Mono<String> getAccessToken() {
        String path = "/collection/token/";
        return momoWebClient.post()
                .uri(path)
                .header("Ocp-Apim-Subscription-Key", momoProperties.getSubscriptionKey())
                .header("X-Target-Environment", momoProperties.getTargetEnvironment())
                .headers(h -> h.setBasicAuth(momoProperties.getApiuserId(), momoProperties.getApiuserApikey()))
                .accept(MediaType.APPLICATION_JSON)
                .exchangeToMono(resp ->
                        resp.bodyToMono(String.class)
                                .defaultIfEmpty("")
                                .flatMap(bodyStr -> {
                                    logger.debug("getAccessToken -> status={} body={}", resp.statusCode(), bodyStr);
                                    if (resp.statusCode().is2xxSuccessful()) {
                                        try {
                                            Map<String, Object> map = objectMapper.readValue(bodyStr.isBlank() ? "{}" : bodyStr, Map.class);
                                            Object t = map.getOrDefault("access_token", map.get("accessToken"));
                                            return Mono.just(t != null ? t.toString() : null);
                                        } catch (Exception ex) {
                                            logger.error("Failed to parse token response body, rawBody={}", bodyStr, ex);
                                            return Mono.error(new IllegalStateException("invalid token response"));
                                        }
                                    } else {
                                        logger.error("getAccessToken failed: status={} body={}", resp.statusCode(), bodyStr);
                                        return Mono.error(new IllegalStateException("token error: " + resp.statusCode() + " body:" + bodyStr));
                                    }
                                })
                );
    }

    /**
     * Call MoMo RequestToPay (collection) as reactive WebClient.
     * If payerMsisdn is missing -> fallback to createPaymentLink (dynamic QR / payment link).
     */
    private Mono<Map<String,Object>> callRequestToPay(String token, Payment payment, CreatePaymentDto dto) {
        String txId = UUID.randomUUID().toString();
        String requestToPayPath = "/collection/v1_0/requesttopay";
        String createPaymentPath = "/collection/v1_0/paymentlink"; // dynamic QR / payment link

        // normalize amount
        String amountStr = payment.getAmount() == null ? "0" : payment.getAmount().setScale(0, RoundingMode.DOWN).toPlainString();

        boolean hasPayer = dto.getPayerMsisdn() != null && !dto.getPayerMsisdn().isBlank();

        if (!hasPayer) {
            // fallback: create payment link / dynamic QR
            Map<String, Object> body = new HashMap<>();
            body.put("amount", amountStr);
            body.put("currency", payment.getCurrency() != null ? payment.getCurrency() : (momoProperties.getCurrency() != null ? momoProperties.getCurrency() : "VND"));
            body.put("externalId", payment.getId().toString());
            // include partnerClientId if provided by DTO
            if (dto.getPartnerClientId() != null) body.put("partnerClientId", dto.getPartnerClientId());
            // include note
            body.put("note", dto.getPayeeNote() != null ? dto.getPayeeNote() : "Order payment");

            logger.info("payerMsisdn empty — using createPaymentLink (dynamic QR). txId={} externalId={}", txId, payment.getId());
            logger.debug("createPaymentLink request body={}", body);

            WebClient.RequestBodySpec req = momoWebClient.post()
                    .uri(createPaymentPath)
                    .header("X-Reference-Id", txId)
                    .header("X-Target-Environment", momoProperties.getTargetEnvironment())
                    .header("Ocp-Apim-Subscription-Key", momoProperties.getSubscriptionKey())
                    .contentType(MediaType.APPLICATION_JSON);

            if (token != null && !token.isBlank()) {
                req = req.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
            } else {
                logger.warn("createPaymentLink called with empty token");
            }

            return req.body(BodyInserters.fromValue(body))
                    .exchangeToMono(resp ->
                            resp.bodyToMono(String.class).defaultIfEmpty("")
                                    .flatMap(bodyStr -> {
                                        logger.debug("createPaymentLink -> status={} respBody={}", resp.statusCode(), bodyStr);
                                        if (resp.statusCode().is2xxSuccessful() || resp.statusCode().value() == 201 || resp.statusCode().value() == 202) {
                                            try {
                                                Map<String, Object> m = objectMapper.readValue(bodyStr.isBlank() ? "{}" : bodyStr, Map.class);
                                                // try common keys for QR/link
                                                Object qr = m.getOrDefault("qrCodeUrl", m.get("paymentUrl"));
                                                Object expires = m.get("expiresAt");
                                                Map<String,Object> result = new HashMap<>();
                                                result.put("txId", txId);
                                                if (qr != null) result.put("qrCodeUrl", qr.toString());
                                                if (expires != null) result.put("expiresAt", expires);
                                                // include whole response when helpful
                                                result.put("rawResponse", m);
                                                return Mono.just(result);
                                            } catch (Exception ex) {
                                                logger.warn("Could not parse createPaymentLink response json, raw={} ", bodyStr, ex);
                                                Map<String,Object> result = Map.of("txId", txId, "rawBody", bodyStr);
                                                return Mono.just(result);
                                            }
                                        } else {
                                            logger.error("createPaymentLink failed: status={} body={}", resp.statusCode(), bodyStr);
                                            return Mono.error(new IllegalStateException("createPaymentLink failed: " + resp.statusCode() + " body:" + bodyStr));
                                        }
                                    })
                    );
        }

        // --- has payer -> normal RequestToPay flow ---
        Map<String, Object> payer = Map.of("partyIdType", "MSISDN", "partyId", dto.getPayerMsisdn());

        Map<String, Object> body = Map.of(
                "amount", amountStr,
                "currency", payment.getCurrency() != null ? payment.getCurrency() : (momoProperties.getCurrency() != null ? momoProperties.getCurrency() : "VND"),
                "externalId", payment.getId().toString(),
                "payer", payer,
                "payerMessage", dto.getPayerMessage() != null ? dto.getPayerMessage() : "",
                "payeeNote", dto.getPayeeNote() != null ? dto.getPayeeNote() : ""
        );

        logger.info("Calling MoMo RequestToPay txId={} amount={} externalId={} payer={}", txId, amountStr, payment.getId(), dto.getPayerMsisdn());
        logger.debug("requestToPay body={}", body);

        WebClient.RequestBodySpec req = momoWebClient.post()
                .uri(requestToPayPath)
                .header("X-Reference-Id", txId)
                .header("X-Target-Environment", momoProperties.getTargetEnvironment())
                .header("Ocp-Apim-Subscription-Key", momoProperties.getSubscriptionKey())
                .contentType(MediaType.APPLICATION_JSON);

        if (token != null && !token.isBlank()) {
            req = req.header(HttpHeaders.AUTHORIZATION, "Bearer " + token);
        } else {
            logger.warn("requestToPay called with empty token");
        }

        return req.body(BodyInserters.fromValue(body))
                .exchangeToMono(resp ->
                        resp.bodyToMono(String.class).defaultIfEmpty("")
                                .flatMap(bodyStr -> {
                                    logger.debug("requestToPay -> status={} txId={} respBody={}", resp.statusCode(), txId, bodyStr);
                                    if (resp.statusCode().is2xxSuccessful() || resp.statusCode().value() == 202 || resp.statusCode().value() == 201) {
                                        if (bodyStr == null || bodyStr.isBlank()) {
                                            return Mono.just(Map.<String, Object>of("txId", txId));
                                        }
                                        try {
                                            Map<String, Object> m = objectMapper.readValue(bodyStr, Map.class);
                                            Object qr = m.get("qrCodeUrl");
                                            Object expires = m.get("expiresAt");
                                            Map<String,Object> result = new HashMap<>();
                                            result.put("txId", txId);
                                            if (qr != null) result.put("qrCodeUrl", qr.toString());
                                            if (expires != null) result.put("expiresAt", expires);
                                            result.put("rawResponse", m);
                                            return Mono.just(result);
                                        } catch (Exception ex) {
                                            logger.warn("Could not parse requestToPay success body as JSON, rawBody={}", bodyStr, ex);
                                            return Mono.just(Map.of("txId", txId, "rawBody", bodyStr));
                                        }
                                    } else {
                                        logger.error("MoMo requestToPay failed: status={} txId={} body={}", resp.statusCode(), txId, bodyStr);
                                        return Mono.error(new IllegalStateException("MoMo requestToPay failed: " + resp.statusCode() + " body:" + bodyStr));
                                    }
                                })
                );
    }

    private static String safeText(JsonNode node, String field) {
        if (node == null || !node.has(field) || node.get(field).isNull()) return null;
        return node.get(field).asText();
    }

    private static String extractFirstNonNull(String... vals) {
        for (String s : vals) {
            if (s != null && !s.isBlank()) return s;
        }
        return null;
    }

    private static int safeInc(Integer v) {
        return v == null ? 1 : v + 1;
    }

    private static String truncate(String s, int max) {
        if (s == null) return null;
        return s.length() <= max ? s : s.substring(0, max);
    }

    private static PaymentStatus mapProviderStatusToPaymentStatus(String raw) {
        if (raw == null) return PaymentStatus.PENDING;
        String r = raw.trim().toLowerCase();
        switch (r) {
            case "successful":
            case "success":
            case "completed":
                return PaymentStatus.SUCCESSFUL;
            case "failed":
            case "failure":
            case "declined":
                return PaymentStatus.FAILED;
            case "pending":
            case "accepted":
                return PaymentStatus.PENDING;
            case "refunded":
                return PaymentStatus.REFUNDED;
            case "cancelled":
            case "canceled":
                return PaymentStatus.CANCELLED;
            default:
                return PaymentStatus.PENDING;
        }
    }

    private static String mapToOrderServiceStatus(PaymentStatus status) {
        if (status == null) return null;
        switch (status) {
            case SUCCESSFUL:
                return "SUCCESS";
            case FAILED:
                return "FAILED";
            case REFUNDED:
                return "REFUNDED";
            case CANCELLED:
                return "CANCELLED";
            case PENDING:
            case INITIATED:
            default:
                return "PENDING";
        }
    }

    // Domain event class (simple)
    public static class PaymentUpdatedEvent {
        private final Object source;
        private final UUID paymentId;
        private final UUID orderId;
        private final PaymentStatus status;
        private final BigDecimal amount;
        private final String momoReference;
        private final Instant timestamp;

        public PaymentUpdatedEvent(Object source, UUID paymentId, UUID orderId, PaymentStatus status, BigDecimal amount, String momoReference, Instant timestamp) {
            this.source = source;
            this.paymentId = paymentId;
            this.orderId = orderId;
            this.status = status;
            this.amount = amount;
            this.momoReference = momoReference;
            this.timestamp = timestamp;
        }

        public Object getSource() { return source; }
        public UUID getPaymentId() { return paymentId; }
        public UUID getOrderId() { return orderId; }
        public PaymentStatus getStatus() { return status; }
        public BigDecimal getAmount() { return amount; }
        public String getMomoReference() { return momoReference; }
        public Instant getTimestamp() { return timestamp; }
    }
}
