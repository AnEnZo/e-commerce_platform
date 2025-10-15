package com.example.Payment_Service.dto;


import com.example.Payment_Service.ennum.PaymentMethod;
import com.example.Payment_Service.ennum.PaymentStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponseDTO {
    private UUID id;
    private UUID orderId;
    private BigDecimal amount;
    private String currency;
    private PaymentStatus status;
    private PaymentMethod method;
    private String transactionReference;
    private String externalId;
    private String momoReference;
    private String payerMsisdn;
    private String qrCodeUrl;
    private Instant qrExpireAt;
    private Instant webhookReceivedAt;
    private String provider;
    private String idempotencyKey;
    private Boolean webhookVerified;
    private Instant createdAt;
    private Instant updatedAt;
    private Long version;
    private UUID parentPaymentId;
    private String paymentType;
    private BigDecimal amountTotal;
    private BigDecimal amountCaptured;
    private BigDecimal amountRefunded;
    private BigDecimal feeTotal;
    private String providerPayloadHash;
}
