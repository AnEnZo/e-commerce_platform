package com.example.Payment_Service.controller;

import com.example.Payment_Service.config.MomoProperties;
import com.example.Payment_Service.dto.CreatePaymentDto;
import com.example.Payment_Service.repository.PaymentRepository;
import com.example.Payment_Service.service.PaymentService;
import com.example.Payment_Service.service.serviceimpl.MomoClient;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.buffer.DataBufferUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final MomoClient momoClient;            // nếu blocking: gọi trong boundedElastic
    private final PaymentRepository paymentRepo;   // giả định reactive R2DBC repo
    private final MomoProperties momoProperties;   // *** inject instance ***
    private final com.example.Payment_Service.mapper.PaymentMapper paymentMapper;


    
    // --- create dynamic QR / initiate payment ---
    @PostMapping("/dynamicQr")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<Map<String, Object>>> createPayment(@Valid @RequestBody CreatePaymentDto dto) {
        return paymentService.createPaymentFromExternal(dto)
                .map(ResponseEntity::ok);
    }
    
    // --- webhook handler (reactive) ---
    @PostMapping("/webhook/momo")
    public Mono<ResponseEntity<String>> handleWebhook(ServerHttpRequest request) {
        final String signatureHeader = request.getHeaders().getFirst("X-Signature"); // chỉ khai báo 1 lần

        return DataBufferUtils.join(request.getBody())
                .map(dataBuffer -> {
                    byte[] bytes = new byte[dataBuffer.readableByteCount()];
                    try {
                        dataBuffer.read(bytes);
                    } finally {
                        DataBufferUtils.release(dataBuffer);
                    }
                    return bytes;
                })
                .flatMap(bodyBytes -> {
                    if (signatureHeader == null || signatureHeader.isBlank()) {
                        return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("missing signature"));
                    }

                    return Mono.fromCallable(() -> {
                                Mac mac = Mac.getInstance("HmacSHA256");
                                SecretKeySpec keySpec = new SecretKeySpec(
                                        momoProperties.getWebhookSecret().getBytes(StandardCharsets.UTF_8),
                                        "HmacSHA256"
                                );
                                mac.init(keySpec);
                                return mac.doFinal(bodyBytes);
                            })
                            .flatMap(computedBytes -> {
                                // Try hex, then base64
                                byte[] headerBytes;
                                try {
                                    headerBytes = hexStringToBytes(signatureHeader.trim());
                                } catch (IllegalArgumentException ignored) {
                                    try {
                                        headerBytes = java.util.Base64.getDecoder().decode(signatureHeader.trim());
                                    } catch (IllegalArgumentException e) {
                                        return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("invalid signature format"));
                                    }
                                }

                                boolean verified = constantTimeEqualsBytes(computedBytes, headerBytes);
                                if (!verified) {
                                    return Mono.just(ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("invalid signature"));
                                }

                                String body = new String(bodyBytes, StandardCharsets.UTF_8);
                                return paymentService.processWebhook(body)
                                        .thenReturn(ResponseEntity.ok("OK"))
                                        .onErrorResume(ex -> {
                                            // log ex
                                            return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("error"));
                                        });
                            })
                            .onErrorResume(ex -> {
                                // log ex
                                return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("verify error"));
                            });
                });
    }


    // --- get payment by id (polling from frontend) ---
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<com.example.Payment_Service.dto.PaymentResponseDTO>> getPayment(@PathVariable UUID id) {
        return paymentRepo.findById(id)
                .map(paymentMapper::toResponseDto)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    private static boolean constantTimeEqualsBytes(byte[] a, byte[] b) {
        if (a == null || b == null) return false;
        if (a.length != b.length) return false;
        int result = 0;
        for (int i = 0; i < a.length; i++) {
            result |= a[i] ^ b[i];
        }
        return result == 0;
    }

    private static byte[] hexStringToBytes(String s) {
        String hex = s.startsWith("0x") ? s.substring(2) : s;
        if (hex.length() % 2 != 0) throw new IllegalArgumentException("Invalid hex length");
        int len = hex.length();
        byte[] data = new byte[len / 2];
        for (int i = 0; i < len; i += 2) {
            int hi = Character.digit(hex.charAt(i), 16);
            int lo = Character.digit(hex.charAt(i + 1), 16);
            if (hi == -1 || lo == -1) throw new IllegalArgumentException("Invalid hex char");
            data[i / 2] = (byte) ((hi << 4) + lo);
        }
        return data;
    }



}
