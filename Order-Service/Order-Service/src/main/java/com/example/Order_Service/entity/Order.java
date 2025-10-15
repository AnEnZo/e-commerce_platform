package com.example.Order_Service.entity;

import com.example.Order_Service.ennum.OrderStatus;
import com.example.Order_Service.ennum.PaymentStatus;
import lombok.*;
import org.springframework.data.annotation.*;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Represents a customer's order for Spring Data R2DBC.
 *
 * Notes:
 * - ID generation should be handled in application code (e.g. UUID.randomUUID()) or by DB defaults.
 * - items is marked @Transient because R2DBC does not support automatic one-to-many mapping.
 *   Save items via OrderItemRepository separately (set orderId on each item).
 */
@Table("orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    @Id
    @Column("id")
    private UUID id;

    @NotNull(message = "User ID must not be null")
    @Column("user_id")
    private UUID userId;

    @NotNull
    @Column("shop_id")
    private UUID shopId;

    @NotNull(message = "Receiver name must not be null")
    @Column("receiver_name")
    private String receiverName;

    @NotNull(message = "Receiver phone must not be null")
    @Column("receiver_phone")
    private String receiverPhone;

    @Column("address_id")
    private UUID addressId;

    @Column("note")
    private String note;

    @Column("order_status")
    private OrderStatus orderStatus;

    @Column("payment_status")
    private PaymentStatus paymentStatus;

    @Column("voucher_shop_id")
    private String voucherShopCode;

    @Column("voucher_platform_id")
    private String voucherPlatformCode;

    @Column("discount_amount")
    private BigDecimal discountAmount;

    @NotNull(message = "Total amount must not be null")
    @Column("total_amount")
    private BigDecimal totalAmount;

    // --- NEW FIELDS ---
    @Column("shipping_fee")
    private BigDecimal shippingFee;

    @Column("idempotency_key")
    private String idempotencyKey;

    /**
     * optimistic locking version (managed by Spring Data)
     */
    @Version
    @Column("version")
    private Long version;

    // R2DBC không tự map collection; giữ transient để tiện xử lý nghiệp vụ trong memory.
    @Transient
    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @CreatedDate
    @Column("created_at")
    private Instant createdAt;

    @LastModifiedDate
    @Column("updated_at")
    private Instant updatedAt;

    // helper để thêm item (nhớ set orderId khi lưu vào DB)
    public void addItem(OrderItem item) {
        // ensure item.orderId will be set before persisting (typically in service)
        items.add(item);
    }

    public void removeItem(OrderItem item) {
        items.remove(item);
    }

    public void recalculateTotal() {
        BigDecimal sum = items.stream()
                .map(OrderItem::getTotalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        if (discountAmount != null) {
            sum = sum.subtract(discountAmount);
        }
        this.totalAmount = sum.max(BigDecimal.ZERO);
    }
}
