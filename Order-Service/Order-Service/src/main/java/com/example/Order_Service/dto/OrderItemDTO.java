package com.example.Order_Service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.relational.core.mapping.Column;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemDTO {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private UUID id;

    /** orderId có thể null khi tạo (sẽ set sau khi tạo order) */
    private UUID orderId;

    @NotNull(message = "Product ID must not be null")
    private UUID productId;

    private String productName;

    @NotNull(message = "Quantity must not be null")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotNull(message = "Unit price must not be null")
    @DecimalMin(value = "0.00", inclusive = true, message = "Unit price must be >= 0")
    private BigDecimal unitPrice;

    @NotNull(message = "Total price must not be null")
    @DecimalMin(value = "0.00", inclusive = true, message = "Total price must be >= 0")
    private BigDecimal totalPrice;

    private Instant createdAt;
    private Instant updatedAt;
}
