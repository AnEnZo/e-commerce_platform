package com.example.product_service.repository;

import com.example.product_service.entity.ReviewImage;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import reactor.core.publisher.Flux;

import java.util.UUID;

public interface ReviewImageRepository extends R2dbcRepository<ReviewImage, UUID> {
    Flux<ReviewImage> findByReviewIdOrderByPositionAsc(UUID reviewId);

}
