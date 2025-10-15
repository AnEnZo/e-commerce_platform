package com.example.product_service.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopRevenueDTO {
    private UUID id;
    private UUID shopId;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private String aggregation;
    private BigDecimal totalGross;
    private BigDecimal totalNet;
    private Long ordersCount;
    private BigDecimal refunds;
    private BigDecimal fees;
    private String currency;
    private String notes;
    private Long version;
    private Instant createdAt;
    private Instant updatedAt;
}