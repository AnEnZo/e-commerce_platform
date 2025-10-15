package com.example.product_service.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.relational.core.mapping.Column;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table("product_image")
public class ProductImage {
    @Id
    private UUID id = UUID.randomUUID();

    @Column("product_id")
    private UUID productId;

    @Column("url")
    private String url;

    @Column("position")
    private Integer position; // order index

    @Column("caption")
    private String caption;

    @Column("published")
    boolean published=false;

    @Column("is_primary")
    private Boolean isPrimary = false;

    @CreatedDate
    @Column("created_at")
    private Instant createdAt;
}
