package com.example.Payment_Service.service.serviceimpl;

import com.example.Payment_Service.config.MomoProperties;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import reactor.util.retry.Retry;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

import static com.example.Payment_Service.config.MomoProperties.bytesToHex;

@Component
@RequiredArgsConstructor
public class MomoClient {

    private static final Logger logger = LoggerFactory.getLogger(MomoClient.class);

    private final MomoProperties props;
    private final WebClient momoWebClient;

    // timeout & retry policy
    private final Duration REQUEST_TIMEOUT = Duration.ofSeconds(10);
    private final Retry RETRY_POLICY = Retry.backoff(2, Duration.ofMillis(200)).maxBackoff(Duration.ofSeconds(2));

    /**
     * Lấy token (Mono<String>) từ endpoint: /collection/token/
     */
    public Mono<String> getToken() {
        String path = "/collection/token/";
        logger.info("Requesting token from Momo: path={} targetEnv={}", path, props.getTargetEnvironment());
        return momoWebClient.post()
                .uri(path)
                .header("Ocp-Apim-Subscription-Key", props.getSubscriptionKey())
                .header("X-Target-Environment", props.getTargetEnvironment())
                .headers(h -> h.setBasicAuth(props.getApiuserId(), props.getApiuserApikey()))
                .accept(MediaType.APPLICATION_JSON)
                .retrieve()
                .onStatus(status -> status.isError(),
                        resp -> resp.bodyToMono(String.class)
                                .defaultIfEmpty("error")
                                .flatMap(body -> {
                                    logger.error("getToken -> error status={} body={}", resp.statusCode(), truncate(body, 1000));
                                    return Mono.<Throwable>error(new IllegalStateException("token error: " + resp.statusCode() + " body:" + body));
                                })
                )
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .timeout(REQUEST_TIMEOUT)
                .retryWhen(RETRY_POLICY)
                .map(map -> {
                    if (map == null) {
                        logger.warn("getToken -> empty response map");
                        return null;
                    }
                    Object t = map.get("access_token");
                    if (t == null) t = map.get("accessToken");
                    logger.debug("getToken -> got token? {}", t != null);
                    return t != null ? t.toString() : null;
                });
    }


    /**
     * Non-blocking RequestToPay (returns Mono of txId string).
     */
    public Mono<String> requestToPay(String token, String amount, String externalId, String payerMsisdn, String payerMessage, String payeeNote) {
        String path = "/collection/v1_0/requesttopay";
        String txId = UUID.randomUUID().toString();

        Map<String, Object> body = Map.of(
                "amount", amount,
                "currency", props.getCurrency() != null ? props.getCurrency() : "VND",
                "externalId", externalId,
                "payer", Map.of("partyIdType", "MSISDN", "partyId", payerMsisdn),
                "payerMessage", payerMessage,
                "payeeNote", payeeNote
        );

        logger.info("requestToPay -> path={} txId={} amount={} externalId={} payer={}", path, txId, amount, externalId, payerMsisdn);
        logger.debug("requestToPay -> body={}", truncate(body.toString(), 1000));

        return momoWebClient.post()
                .uri(path)
//                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
//                .header("X-Reference-Id", txId)
//                .header("X-Target-Environment", props.getTargetEnvironment())
//                .header("Ocp-Apim-Subscription-Key", props.getSubscriptionKey())
                .contentType(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromValue(body))
                .exchangeToMono(resp -> {
                    logger.debug("requestToPay -> responseStatus={} txId={}", resp.statusCode(), txId);
                    if (resp.statusCode().is2xxSuccessful()) {
                        return Mono.just(txId);
                    }
                    return resp.bodyToMono(String.class)
                            .defaultIfEmpty("error")
                            .flatMap(bodyStr -> {
                                logger.error("requestToPay failed -> status={} txId={} body={}", resp.statusCode(), txId, truncate(bodyStr, 2000));
                                return Mono.<String>error(new IllegalStateException("RequestToPay failed: " + resp.statusCode() + " body:" + bodyStr));
                            });
                })
                .timeout(REQUEST_TIMEOUT)
                .retryWhen(RETRY_POLICY);
    }

    /**
     * Create payment link / dynamic QR — trả Map chứa response body + txId.
     */
    public Mono<Map<String, Object>> createPaymentLink(String token,
                                                       String amount,
                                                       String externalId,
                                                       String callbackUrl,
                                                       String partnerClientId) {
        String path = "/v2/gateway/api/create"; // SỬA ENDPOINT
        String txId = UUID.randomUUID().toString();

        // Tạo các thông tin cần thiết
        String orderId = "ORDER_" + System.currentTimeMillis();
        String orderInfo = "Payment for order " + orderId;

        String requestId = txId;
        String signature = generateSignature(amount, orderId, orderInfo, requestId);

        Map<String, Object> body = Map.ofEntries(
                Map.entry("partnerCode", props.getPartnerCode()),
                Map.entry("partnerName", props.getPartnerName()),
                Map.entry("storeId", "store001"),
                Map.entry("requestType", props.getRequestType()),
                Map.entry("ipnUrl", props.getCallbackUrl()),
                Map.entry("redirectUrl", props.getCallbackUrl()),
                Map.entry("orderId", orderId),
                Map.entry("amount", amount),
                Map.entry("lang", "vi"),
                Map.entry("orderInfo", orderInfo),
                Map.entry("requestId", requestId),
                Map.entry("extraData", ""),
                Map.entry("signature", signature),
                Map.entry("currency", props.getCurrency())
        );

        logger.info("createPaymentLink -> path={} txId={} orderId={} amount={}", path, txId, orderId, amount);
        logger.debug("createPaymentLink -> requestId={} signaturePresent={}", requestId, signature != null && !signature.isBlank());

        return momoWebClient.post()
                .uri(path)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .header("X-Reference-Id", txId)
                .header("X-Target-Environment", props.getTargetEnvironment())
                .header("Ocp-Apim-Subscription-Key", props.getSubscriptionKey())
                .contentType(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromValue(body))
                .retrieve()
                .onStatus(status -> status.isError(),
                        resp -> resp.bodyToMono(String.class)
                                .defaultIfEmpty("error")
                                .flatMap(bodyStr -> {
                                    logger.error("createPaymentLink failed -> status={} body={}", resp.statusCode(), truncate(bodyStr, 2000));
                                    return Mono.<Throwable>error(new IllegalStateException("Create payment link failed: " + resp.statusCode() + " body:" + bodyStr));
                                })
                )
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                .map(respMap -> {
                    Map<String, Object> result = new HashMap<>(respMap != null ? respMap : Map.of());
                    result.put("txId", txId);
                    logger.debug("createPaymentLink -> success txId={} respKeys={}", txId, result.keySet());
                    return result;
                })
                .timeout(REQUEST_TIMEOUT)
                .retryWhen(RETRY_POLICY);
    }

    public Mono<Map<String, Object>> getRequestToPayStatus(String token, String txId) {
        String path = "/collection/v1_0/requesttopay/" + txId;
        logger.debug("getRequestToPayStatus -> path={} txId={}", path, txId);
        return momoWebClient.get()
                .uri(path)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .header("Ocp-Apim-Subscription-Key", props.getSubscriptionKey())
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {});
    }

    private String generateSignature(String amount, String orderId, String orderInfo, String requestId) {
        try {
            String rawSignature = "accessKey=" + props.getAccessKey() +
                    "&amount=" + amount +
                    "&extraData=" + "" +
                    "&ipnUrl=" + props.getCallbackUrl() +
                    "&orderId=" + orderId +
                    "&orderInfo=" + orderInfo +
                    "&partnerCode=" + props.getPartnerCode() +
                    "&redirectUrl=" + props.getCallbackUrl() +
                    "&requestId=" + requestId +
                    "&requestType=" + props.getRequestType();

            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKeySpec = new SecretKeySpec(props.getSecretKey().getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKeySpec);
            byte[] bytes = mac.doFinal(rawSignature.getBytes(StandardCharsets.UTF_8));
            return bytesToHex(bytes); // static import hoặc MomoProperties.bytesToHex(...)
        } catch (Exception e) {
            logger.error("Error generating signature: {}", e.getMessage(), e);
            throw new RuntimeException("Error generating signature", e);
        }
    }

    // small helper to avoid huge logs
    private static String truncate(String s, int max) {
        if (s == null) return null;
        return s.length() <= max ? s : s.substring(0, max) + "...(truncated)";
    }

    private static String truncate(Object o, int max) {
        return truncate(o == null ? null : String.valueOf(o), max);
    }
}
