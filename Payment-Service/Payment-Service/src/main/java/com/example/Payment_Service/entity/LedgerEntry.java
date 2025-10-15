package com.example.Payment_Service.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Table("ledger_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LedgerEntry {
    @Id
    private UUID id;

    private UUID relatedId; // payment/allocation/refund/settlement

    private String relatedType; // PAYMENT|ALLOCATION|REFUND|SETTLEMENT

    private String account; // e.g., "CASH", "LIABILITY_TO_SELLER", "REVENUE"

    private BigDecimal amount;

    private String entryType; // DEBIT | CREDIT

    @CreatedDate
    @Column("created_at")
    private Instant createdAt;
}

