// ProductVideoRepository.java
package com.example.product_service.repository;

import com.example.product_service.entity.ProductVideo;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.data.r2dbc.repository.Query;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface ProductVideoRepository extends R2dbcRepository<ProductVideo, UUID> {
    Flux<ProductVideo> findByProductIdOrderByPositionAsc(UUID productId);
    Flux<ProductVideo> findByProductId(UUID productId);

    // xóa theo productId + videoId, trả số row affected
    @Query("DELETE FROM product_video WHERE product_id = :productId AND id = :id")
    Mono<Integer> deleteByProductIdAndId(UUID productId, UUID id);

    // xóa tất cả video của product, trả số row affected
    @Query("DELETE FROM product_video WHERE product_id = :productId")
    Mono<Integer> deleteByProductId(UUID productId);
}
