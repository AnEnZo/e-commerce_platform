package com.example.Payment_Service.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LedgerEntryDto {
    private UUID id;
    private UUID relatedId;
    private String relatedType;
    private String account;
    private BigDecimal amount;
    private String entryType;
    private Instant createdAt;
}
