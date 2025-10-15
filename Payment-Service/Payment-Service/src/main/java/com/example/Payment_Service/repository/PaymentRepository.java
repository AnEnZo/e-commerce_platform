package com.example.Payment_Service.repository;


import com.example.Payment_Service.entity.Payment;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface PaymentRepository extends R2dbcRepository<Payment, UUID> {
    Mono<Payment> findByTransactionReference(String transactionReference);
    Mono<Payment> findByExternalId(String externalId);
    Mono<Payment> findByIdempotencyKey(String idempotencyKey);
    Mono<Payment> findByOrderId(UUID orderId);
    Mono<Payment> findByMomoReference(String momoReference);

    // Add support for multi-shop orders
    Flux<Payment> findAllByParentPaymentId(UUID parentPaymentId);
    Flux<Payment> findAllByPaymentType(String paymentType);
    Mono<Payment> findByOrderIdAndShopId(UUID orderId, String shopId);
}
