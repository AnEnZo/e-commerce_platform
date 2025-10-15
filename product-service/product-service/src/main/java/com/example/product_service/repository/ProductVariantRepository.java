// ProductVariantRepository.java
package com.example.product_service.repository;

import com.example.product_service.dto.ProductVariantInfo;
import com.example.product_service.entity.ProductVariant;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

@Repository
public interface ProductVariantRepository extends R2dbcRepository<ProductVariant, UUID> {

    Flux<ProductVariant> findByProductId(UUID productId);

    Mono<ProductVariant> findById(UUID id);

    // trả về số row affected
    @Query("DELETE FROM product_variant WHERE product_id = :productId")
    Mono<Integer> deleteByProductId(UUID productId);

    /**
     * Lấy tất cả variant theo list id (reactive)
     */
    @Query("SELECT * FROM product_variant WHERE id IN (:ids)")
    Flux<ProductVariant> findAllByIdIn(List<UUID> ids);

    /**
     * Giảm số lượng tồn kho. Chỉ giảm nếu quantity_on_hand >= :qty.
     * Trả về số row affected (0 nếu không đủ stock).
     */
    @Query("UPDATE product_variant " +
            "SET quantity_on_hand = quantity_on_hand - :qty " +
            "WHERE id = :variantId AND quantity_on_hand >= :qty")
    Mono<Integer> decrementQuantity(UUID variantId, int qty);
}
