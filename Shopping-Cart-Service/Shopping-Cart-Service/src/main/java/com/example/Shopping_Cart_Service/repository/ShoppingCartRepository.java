package com.example.Shopping_Cart_Service.repository;

import com.example.Shopping_Cart_Service.entity.ShoppingCart;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Mono;

import java.util.Optional;
import java.util.UUID;

public interface ShoppingCartRepository extends ReactiveCrudRepository<ShoppingCart, UUID> {
    Mono<ShoppingCart> findByUserId(UUID userId);
}