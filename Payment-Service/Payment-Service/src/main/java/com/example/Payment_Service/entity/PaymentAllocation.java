package com.example.Payment_Service.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Table("payment_allocations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentAllocation {
    @Id
    private UUID id;

    @Column("payment_id")
    private UUID paymentId;
    // FK -> payments.id (parent or child)
    @Column("order_id")
    private UUID orderId;

    @Column("shop_id")
    private UUID shopId;

    @Column("amount")
    private BigDecimal amount;

    @Column("fee")
    private BigDecimal fee;
    // gross fee for this allocation
    @Column("tax")
    private BigDecimal tax;

    @Column("net_amount")
    private BigDecimal netAmount;
    // amount - fee - tax
    @Column("status")
    private String status; // ALLOCATED, CAPTURED, REFUNDED_PARTIAL, REFUNDED_FULL

    @Column("settlement_id")
    private UUID settlementId; // FK -> settlements

    @CreatedDate
    @Column("created_at")
    private Instant createdAt;

    @LastModifiedDate
    @Column("updated_at")
    private Instant updatedAt;

}
