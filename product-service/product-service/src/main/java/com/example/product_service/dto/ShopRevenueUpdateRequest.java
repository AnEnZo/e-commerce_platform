package com.example.product_service.dto;

import lombok.*;


import java.math.BigDecimal;
import java.time.LocalDate;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopRevenueUpdateRequest {
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private String aggregation;
    private BigDecimal totalGross;
    private BigDecimal refunds;
    private BigDecimal fees;
    private Long ordersCount;
    private String currency;
    private String notes;
}