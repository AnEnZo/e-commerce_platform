package com.example.product_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopRevenueCreateRequest {
    @NotNull
    private UUID shopId;


    @NotNull
    private LocalDate periodStart;


    @NotNull
    private LocalDate periodEnd;


    @NotNull
    private String aggregation;


    private BigDecimal totalGross;
    private BigDecimal refunds;
    private BigDecimal fees;
    private Long ordersCount;
    private String currency;
    private String notes;
}