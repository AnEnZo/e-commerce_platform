package com.example.product_service.entity;

import com.example.product_service.ennum.ProductStatus;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.relational.core.mapping.Column;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table("product")
public class Product {
    @Id
    private UUID id = UUID.randomUUID();

    @NotBlank
    @Size(max = 50)
    @Column("name")
    private String name;

    @Size(max = 100)
    @Column("barcode")
    private String barcode;

    @Column("description")
    private String description;

    @Column("status")
    private ProductStatus status;

    @Column("sales_count")
    private Long salesCount = 0L;

    @Column("weight")
    private BigDecimal weight;

    @Column("length")
    private BigDecimal length;

    @Column("width")
    private BigDecimal width;

    @Column("height")
    private BigDecimal height;

    @Column("average_rating")
    private BigDecimal averageRating = BigDecimal.ZERO;

    @Column("review_count")
    private Integer reviewCount = 0;

    @NotBlank
    @Column("slug")
    private String slug;

    @Column("meta_title")
    private String metaTitle;

    @Column("meta_description")
    private String metaDescription;

    // foreign keys
    @Column("category_id")
    private UUID categoryId;

    @Column("shop_id")
    private UUID shopId;

    @Version
    private Long version;

    @CreatedDate
    @Column("created_at")
    private Instant createdAt;

    @LastModifiedDate
    @Column("updated_at")
    private Instant updatedAt;
}
