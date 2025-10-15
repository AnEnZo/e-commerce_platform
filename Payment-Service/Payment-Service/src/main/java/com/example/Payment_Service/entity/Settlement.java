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

@Table("settlements")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Settlement {
    @Id
    private UUID id;
    @Column("shop_id")
    private UUID shopId;

    private BigDecimal grossAmount;

    private BigDecimal fees;

    private BigDecimal netAmount;

    private String status; // SCHEDULED, PAID, FAILED

    @Column("scheduled_date")
    private Instant scheduledDate;

    @Column("paid_date")
    private Instant paidDate;

    @Column("provider_payout_id")
    private String providerPayoutId;

    @CreatedDate
    @Column("created_at")
    private Instant createdAt;

    @LastModifiedDate
    @Column("updated_at")
    private Instant updatedAt;

}
