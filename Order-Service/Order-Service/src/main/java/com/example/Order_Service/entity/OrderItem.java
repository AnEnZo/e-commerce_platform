package com.example.Order_Service.entity;

import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * Represents a single line item within an order for Spring Data R2DBC.
 * Note: orderId is stored as a UUID foreign key; there is no @ManyToOne relation.
 */
@Table("order_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {
    @Id
    @Column("id")
    private UUID id;

    // foreign key to orders.id
    @NotNull(message = "Order ID must not be null")
    @Column("order_id")
    private UUID orderId;

    @NotNull(message = "Product ID must not be null")
    @Column("product_id")
    private UUID productId;

    @Column("product_name")         // snapshot
    private String productName;

    @NotNull(message = "Quantity must not be null")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Column("quantity")
    private Integer quantity;

    @NotNull(message = "Unit price must not be null")
    @Column("unit_price")
    private BigDecimal unitPrice;

    @NotNull(message = "Total price must not be null")
    @Column("total_price")
    private BigDecimal totalPrice;

    @CreatedDate
    @Column("created_at")
    private Instant createdAt;

    @LastModifiedDate
    @Column("updated_at")
    private Instant updatedAt;
}
