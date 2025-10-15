package com.example.Shopping_Cart_Service.repository;

import com.example.Shopping_Cart_Service.entity.CartItem;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface CartItemRepository extends ReactiveCrudRepository<CartItem, UUID> {
    Flux<CartItem> findByCartId(UUID cartId);
    Mono<CartItem> findByCartIdAndVariantId(UUID cartId, UUID variantId);
    Flux<CartItem> findByCartIdAndVariantIdOrderByCreatedAtAsc(UUID cartId, UUID variantId);
}