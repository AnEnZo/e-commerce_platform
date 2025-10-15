package com.example.product_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.validation.constraints.PositiveOrZero;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVariantDTO {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private UUID id;
    private String sku;
    private String color;
    private String size;
    private BigDecimal basePrice; // giá gốc bắt buộc
    private BigDecimal salePrice; // giá bán (có thể null hoặc = basePrice nếu không giảm)
    private Integer quantityOnHand;
    private UUID productId;
}
