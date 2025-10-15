// ProductImageRepository.java
package com.example.product_service.repository;

import com.example.product_service.entity.ProductImage;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface ProductImageRepository extends R2dbcRepository<ProductImage, UUID> {
    Flux<ProductImage> findByProductIdOrderByPositionAsc(UUID productId);
    Flux<ProductImage> findByProductId(UUID productId);
    // trả về số row affected để caller biết có xóa gì không
    Mono<Integer> deleteByProductId(UUID productId);
}
