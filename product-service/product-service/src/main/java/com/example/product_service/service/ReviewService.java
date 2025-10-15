package com.example.product_service.service;

import com.example.product_service.dto.ReviewDTO;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

public interface ReviewService {
    Mono<ReviewDTO> createReview(ReviewDTO dto);
    Mono<ReviewDTO> getReviewById(UUID id);
    Flux<ReviewDTO> getAllReviews();
    Flux<ReviewDTO> getReviewsByProductId(UUID productId);
    Mono<ReviewDTO> updateReview(UUID id, ReviewDTO dto);
    Mono<Void> deleteReview(UUID id);
}
