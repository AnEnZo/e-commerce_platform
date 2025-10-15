package com.example.product_service.dto;


import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class SearchCriteria {

    private String keyword;

    private String categoryName;

    private String shopId;

    private String shopName;

    private BigDecimal minPrice;

    private BigDecimal maxPrice;

    private BigDecimal minRating;

    private boolean inStockOnly = false;

    private String status = "ACTIVE";

    private String color;

    private String size;
}