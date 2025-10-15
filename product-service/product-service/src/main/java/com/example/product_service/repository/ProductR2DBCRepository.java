package com.example.product_service.repository;


import com.example.product_service.entity.Product;

import org.springframework.data.domain.Page;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import org.springframework.data.domain.Pageable;
import java.util.List;
import java.util.UUID;

@Repository
public interface ProductR2DBCRepository extends R2dbcRepository<Product, UUID> {

    // Reactive find by id
    Mono<Product> findById(UUID id);

    Flux<Product> findAllBy(Pageable pageable);

    // All products by category id (no paging)
    Flux<Product> findByCategoryId(UUID categoryId);

    // All products by shop id
    Flux<Product> findByShopId(UUID shopId);

    // Find products by category name (SQL JOIN). Use when you store category names in category table.
    @Query("SELECT p.* FROM product p JOIN category c ON p.category_id = c.id WHERE c.name = :categoryName")
    Flux<Product> findByCategoryName(String categoryName);

    // Pagination via limit/offset (reactive). Use service layer to calculate limit/offset from Pageable.
    @Query("SELECT * FROM product WHERE category_id = :categoryId ORDER BY created_at DESC LIMIT :limit OFFSET :offset")
    Flux<Product> findByCategoryIdWithPagination(UUID categoryId, int limit, int offset);

    // Another helper: find by slug
    Mono<Product> findBySlug(String slug);

    // Increment sales_count atomically (returns number of rows updated)
    @Query("UPDATE product SET sales_count = sales_count + :qty WHERE id = :id")
    Mono<Integer> incrementSalesCount(UUID id, long qty);


    @Query("SELECT COUNT(*) FROM product p JOIN category c ON p.category_id = c.id WHERE c.name = :categoryName")
    Mono<Long> countByCategoryName(String categoryName);

    @Query("SELECT p.* FROM product p JOIN category c ON p.category_id = c.id " +
            "WHERE c.name = :categoryName ORDER BY p.created_at DESC LIMIT :limit OFFSET :offset")
    Flux<Product> findByCategoryNameWithPagination(String categoryName, int limit, int offset);

}
