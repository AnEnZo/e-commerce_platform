package com.example.product_service.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.relational.core.mapping.Column;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table("product_variant")
public class ProductVariant {
    @Id
    private UUID id = UUID.randomUUID();

    @NotBlank
    @Column("sku")
    private String sku;

    @Column("color")
    private String color;

    @Column("size")
    private String size;

    @PositiveOrZero
    @Column("base_price")
    private BigDecimal basePrice;

    @PositiveOrZero
    @Column("sale_price")
    private BigDecimal salePrice;

    @PositiveOrZero
    @Column("quantity_on_hand")
    private Integer quantityOnHand;

    // FK to product
    @Column("product_id")
    private UUID productId;

    @Version
    private Long version;
}
