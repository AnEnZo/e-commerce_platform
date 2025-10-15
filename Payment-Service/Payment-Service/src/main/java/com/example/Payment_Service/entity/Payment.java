package com.example.Payment_Service.entity;

import com.example.Payment_Service.ennum.PaymentMethod;
import com.example.Payment_Service.ennum.PaymentStatus;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Version;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Table("payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {

    @Id
    private UUID id;

    @Column("order_id")
    private UUID orderId;

    private BigDecimal amount;

    /**
     * Currency (VND, EUR, etc.)
     */
    private String currency;

    private PaymentStatus status;  // INITIATED, PENDING, SUCCESSFUL, FAILED, REFUNDED, CANCELLED

    private PaymentMethod method; // MOMO_BANK_TRANSFER, CREDIT_CARD, CASH_ON_DELIVERY

    /**
     * Your internal transaction reference (optional).
     */
    private String transactionReference;

    /**
     * externalId bạn gửi cho MoMo (dùng để map callback -> order).
     */
    @Column("external_id")
    private String externalId;

    /**
     * X-Reference-Id hoặc transactionId do MoMo yêu cầu/hoặc trả về.
     */
    @Column("momo_reference")
    private String momoReference;

    /**
     * Số điện thoại người trả (MSISDN) nếu biết.
     */
    @Column("payer_msisdn")
    private String payerMsisdn;

    /**
     * Nếu dùng dynamic QR: URL hoặc data của QR (nếu MoMo trả).
     */
    @Column("qr_code_url")
    private String qrCodeUrl;

    /**
     * QR expire time nếu có.
     */
    @Column("qr_expire_at")
    private Instant qrExpireAt;

    /**
     * Thời điểm webhook cuối cùng được nhận (useful for auditing).
     */
    @Column("webhook_received_at")
    private Instant webhookReceivedAt;

    /**
     * Raw webhook payload (có thể dài). Cân nhắc truncate/encrypt trên prod.
     */
    @Column("webhook_payload")
    private String webhookPayload;

    /**
     * Số lần callback/retry đã nhận.
     */
    @Column("webhook_attempts")
    private Integer webhookAttempts;

    // --- NEW FIELDS ---
    @Column("idempotency_key")
    private String idempotencyKey;

    @Column("webhook_verified")
    @Builder.Default
    private Boolean webhookVerified = false;

    @Column("provider")
    private String provider; // e.g., "MOMO", "BANK_TRANSFER", "STRIPE"

    /**
     * Parent payment ID for multi-shop orders
     */
    @Column("parent_payment_id")
    private UUID parentPaymentId;

    /**
     * Payment type (SINGLE_ORDER, MULTI_ORDER)
     */
    @Column("payment_type")
    private String paymentType;

    /**
     * Shop ID for the order
     */
    @Column("shop_id")
    private UUID shopId;

    /**
     * Total amount for all orders in case of multi-shop payment
     */
    @Column("amount_total") // optional if amount is per-record
    private BigDecimal amountTotal; // useful for parent payment (sum of allocations)

    @Column("amount_captured")
    private BigDecimal amountCaptured; // total captured from PG

    @Column("amount_refunded")
    private BigDecimal amountRefunded;

    @Column("fee_total")
    private BigDecimal feeTotal; // total fees deducted before payout

    @Column("provider_payload_hash")
    private String providerPayloadHash; // store hash instead of raw payload (secure)
    /**
     * optimistic locking version (managed by Spring Data)
     */
    @Version
    @Column("version")
    private Long version;
    // --- END NEW FIELDS ---

    @CreatedDate
    @Column("created_at")
    private Instant createdAt;

    @LastModifiedDate
    @Column("updated_at")
    private Instant updatedAt;
}
