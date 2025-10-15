package com.example.product_service.repository;



import com.example.product_service.entity.Category;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Mono;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends R2dbcRepository<Category, UUID> {
    Mono<Category> findByName(String name);
    Mono<Boolean> existsByName(String categoryName);
}
