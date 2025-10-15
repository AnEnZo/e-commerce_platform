package com.example.Payment_Service.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SettlementDto {
    private UUID id;
    private UUID shopId;
    private BigDecimal grossAmount;
    private BigDecimal fees;
    private BigDecimal netAmount;
    private String status;
    private Instant scheduledDate;
    private Instant paidDate;
    private String providerPayoutId;
    private Instant createdAt;
    private Instant updatedAt;
}
