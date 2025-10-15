package com.example.product_service.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Version;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.relational.core.mapping.Column;

import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table("review")
public class Review {
    @Id
    private UUID id = UUID.randomUUID();

    @Min(1) @Max(5)
    @Column("rating")
    private Integer rating;

    @Size(max = 500)
    @Column("comment")
    private String comment;

    // FK to product
    @Column("product_id")
    private UUID productId;

    @NotBlank
    @Column("reviewer_name")
    private String reviewerName;

    @Version
    private Long version;

    @CreatedDate
    @Column("created_at")
    private Instant createdAt;

    @LastModifiedDate
    @Column("updated_at")
    private Instant updatedAt;
}
