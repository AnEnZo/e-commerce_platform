package com.example.product_service.repository;

import com.example.product_service.entity.Shop;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface ShopRepository extends R2dbcRepository<Shop, UUID> {
    Mono<Boolean> existsByName(String name);
    Mono<Boolean> existsByOwnerId(UUID ownerId);
    Mono<Shop> findByOwnerId(UUID ownerId);

}