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

@Table("refunds")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Refund {
    @Id
    private UUID id;

    @Column("payment_id")
    private UUID paymentId;

    @Column("allocation_id")
    private UUID allocationId;// optional

    @Column("amount")
    private BigDecimal amount;

    @Column("reason")
    private String reason;

    @Column("status")
    private String status; // REQUESTED, PROCESSING, SUCCESS, FAILED

    @Column("provider_refund_id")
    private String providerRefundId;

    @CreatedDate
    @Column("created_at")
    private Instant createdAt;

    @LastModifiedDate
    @Column("updated_at")
    private Instant updatedAt;

}
