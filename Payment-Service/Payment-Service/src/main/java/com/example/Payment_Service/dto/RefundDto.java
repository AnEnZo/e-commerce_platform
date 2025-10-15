package com.example.Payment_Service.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefundDto {
    private UUID id;
    private UUID paymentId;
    private UUID allocationId;
    private BigDecimal amount;
    private String reason;
    private String status;
    private String providerRefundId;
    private Instant createdAt;
    private Instant updatedAt;
}
