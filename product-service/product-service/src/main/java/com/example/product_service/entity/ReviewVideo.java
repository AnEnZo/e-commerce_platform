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
@Table("review_video")
public class ReviewVideo {
    @Id
    private UUID id = UUID.randomUUID();

    @Column("review_id")
    private UUID reviewId;

    @Column("url")
    private String url;

    @Column("position")
    private Integer position;

    @CreatedDate
    @Column("created_at")
    private Instant createdAt;
}
