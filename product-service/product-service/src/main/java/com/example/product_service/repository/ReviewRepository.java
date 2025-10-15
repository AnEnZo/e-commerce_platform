package com.example.product_service.repository;

import com.example.product_service.entity.Review;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import java.util.UUID;

@Repository
public interface ReviewRepository extends R2dbcRepository<Review, UUID> {
    Flux<Review> findAllByProductId(UUID productId);
}