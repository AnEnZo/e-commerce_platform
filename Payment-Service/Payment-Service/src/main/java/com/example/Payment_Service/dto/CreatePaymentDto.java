package com.example.Payment_Service.dto;


import com.example.Payment_Service.ennum.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * DTO cho request tạo payment (tạo Dynamic QR / payment link).
 *
 * Ví dụ JSON:
 * {
 *   "orderId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
 *   "amount": 150000,
 *   "currency": "VND",
 *   "idempotencyKey": "client-req-123",
 *   "payerMsisdn": "84901234567",
 *   "payerMessage": "Thanh toán đơn #123",
 *   "payeeNote": "Order 123",
 *   "partnerClientId": "web-shop-01",
 *   "method": "MOMO_BANK_TRANSFER"
 * }
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePaymentDto {

    /**
     * id order của hệ thống (bắt buộc)
     */
    @NotNull(message = "orderId must not be null")
    private UUID orderId;

    /**
     * số tiền (bắt buộc). Sử dụng DecimalMin để tránh giá trị <= 0
     */
    @NotNull(message = "amount must not be null")
    @DecimalMin(value = "0.01", inclusive = true, message = "amount must be greater than 0")
    private BigDecimal amount;

    /**
     * Mã tiền tệ (VND, EUR...). Mặc định VND nếu không gửi.
     */
    @Builder.Default
    private String currency = "VND";

    /**
     * Idempotency key do client cung cấp để tránh duplicate requests (tuỳ chọn)
     */
    private String idempotencyKey;

    /**
     * MSISDN người trả (ví dụ: 84901234567). Không bắt buộc nhưng hữu ích cho RequestToPay.
     * Pattern đơn giản: chỉ chứa chữ số, có thể điều chỉnh theo yêu cầu.
     */
    @Pattern(regexp = "^[0-9+]*$", message = "payerMsisdn must contain only digits or +")
    private String payerMsisdn;

    /**
     * Tin nhắn hiển thị cho payer (tuỳ chọn)
     */
    private String payerMessage;

    /**
     * Ghi chú dành cho payee (tuỳ chọn)
     */
    private String payeeNote;

    /**
     * Partner / client id (ví dụ: web-shop-01) nếu cần gửi kèm tới provider
     */
    private String partnerClientId;

    /**
     * Phương thức thanh toán mong muốn (tuỳ chọn).
     */
    private PaymentMethod method;

    private String provider;
    private UUID parentPaymentId;
    private String paymentType;
    private BigDecimal amountTotal;
    private BigDecimal amountCaptured;
    private BigDecimal amountRefunded;
    private BigDecimal feeTotal;
    private String providerPayloadHash;

    /**
     * List of order IDs when paying for multiple orders from different shops
     */
    private List<UUID> orderIds;

    /**
     * Map of shop IDs to their respective order IDs
     */
    private Map<String, UUID> shopOrders;
}
