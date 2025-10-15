package com.example.Shopping_Cart_Service.service;

import com.example.Shopping_Cart_Service.dto.CartItemDTO;
import com.example.Shopping_Cart_Service.dto.ShoppingCartDTO;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface ShoppingCartService {
    Mono<ShoppingCartDTO> getCartByUserId(UUID userId);
    Mono<ShoppingCartDTO> addItemToCart(UUID userId, CartItemDTO itemDTO);
    Mono<ShoppingCartDTO> removeItemFromCart(UUID userId, UUID itemId);
    Mono<ShoppingCartDTO> clearCart(UUID userId);
    Mono<ShoppingCartDTO> createCart(UUID userId);
    Mono<ShoppingCartDTO> removeItemCompletely(UUID userId, UUID itemId);
    Mono<ShoppingCartDTO> updateItemQuantity(UUID userId, UUID itemId, int quantity);
}