package com.example.product_service.service.impl;

import com.example.product_service.dto.ReviewDTO;
import com.example.product_service.entity.Review;
import com.example.product_service.mapper.ReviewMapper;
import com.example.product_service.repository.ReviewRepository;
import com.example.product_service.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository repository;
    private final ReviewMapper mapper;

    @Override
    public Mono<ReviewDTO> createReview(ReviewDTO dto) {
        Review entity = mapper.toEntity(dto);
        // gán productId (UUID) thay vì object Product
        entity.setProductId(dto.getProductId());

        return repository.save(entity)
                .map(mapper::toDto);
    }

    @Override
    public Mono<ReviewDTO> getReviewById(UUID id) {
        return repository.findById(id)
                .map(mapper::toDto)
                .switchIfEmpty(Mono.error(new RuntimeException("Review not found")));
    }

    @Override
    public Flux<ReviewDTO> getAllReviews() {
        return repository.findAll()
                .map(mapper::toDto);
    }

    @Override
    public Flux<ReviewDTO> getReviewsByProductId(UUID productId) {
        // ưu tiên dùng query repository chuyên dụng (tốt hơn là filter trên findAll)
        return repository.findAllByProductId(productId)
                .map(mapper::toDto);
    }

    @Override
    public Mono<ReviewDTO> updateReview(UUID id, ReviewDTO dto) {
        return repository.findById(id)
                .switchIfEmpty(Mono.error(new RuntimeException("Review not found")))
                .flatMap(existing -> {
                    existing.setRating(dto.getRating());
                    existing.setComment(dto.getComment());
                    existing.setReviewerName(dto.getReviewerName());
                    if (dto.getProductId() != null) {
                        existing.setProductId(dto.getProductId());
                    }
                    return repository.save(existing);
                })
                .map(mapper::toDto);
    }

    @Override
    public Mono<Void> deleteReview(UUID id) {
        return repository.findById(id)
                .switchIfEmpty(Mono.error(new RuntimeException("Review not found")))
                .flatMap(repository::delete);
    }
}
