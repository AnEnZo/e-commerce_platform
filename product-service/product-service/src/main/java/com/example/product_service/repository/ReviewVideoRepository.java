package com.example.product_service.repository;

import com.example.product_service.entity.ReviewImage;
import com.example.product_service.entity.ReviewVideo;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import reactor.core.publisher.Flux;

import java.util.UUID;

public interface ReviewVideoRepository extends R2dbcRepository<ReviewVideo, UUID> {
    Flux<ReviewImage> findByReviewIdOrderByPositionAsc(UUID reviewId);
}
