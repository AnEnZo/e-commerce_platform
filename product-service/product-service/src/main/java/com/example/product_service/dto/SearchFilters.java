package com.example.product_service.dto;

import lombok.Data;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class SearchFilters {
    private List<String> categories;
    private List<String> shops;
    private List<String> colors;
    private List<String> sizes;
    private PriceRange priceRange;
    private RatingRange ratingRange;

    @Data
    @Builder
    public static class PriceRange {
        private BigDecimal min;
        private BigDecimal max;
    }

    @Data
    @Builder
    public static class RatingRange {
        private BigDecimal min;
        private BigDecimal max;
    }
}