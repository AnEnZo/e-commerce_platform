package com.example.Shopping_Cart_Service.controller;

import com.example.Shopping_Cart_Service.dto.CartItemDTO;
import com.example.Shopping_Cart_Service.dto.ShoppingCartDTO;
import com.example.Shopping_Cart_Service.service.ShoppingCartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;

import java.util.UUID;

@RestController
@RequestMapping("/api/carts")
@RequiredArgsConstructor
public class ShoppingCartController {

    private final ShoppingCartService cartService;

    @PostMapping("/{userId}")
    public Mono<ResponseEntity<ShoppingCartDTO>> createCart(@PathVariable UUID userId) {
        return cartService.createCart(userId)
                .map(ResponseEntity::ok);
    }

    @GetMapping("/{userId}")
    public Mono<ResponseEntity<ShoppingCartDTO>> getCart(@PathVariable UUID userId) {
        return cartService.getCartByUserId(userId)
                .map(ResponseEntity::ok);
    }

    @PostMapping("/{userId}/items")
    public Mono<ResponseEntity<ShoppingCartDTO>> addItem(
            @PathVariable UUID userId,
            @RequestBody CartItemDTO itemDTO) {
        return cartService.addItemToCart(userId, itemDTO)
                .map(ResponseEntity::ok);
    }

    @DeleteMapping("/{userId}/items/{itemId}")
    public Mono<ResponseEntity<ShoppingCartDTO>> removeItem(
            @PathVariable UUID userId,
            @PathVariable UUID itemId) {
        return cartService.removeItemFromCart(userId, itemId)
                .map(ResponseEntity::ok);
    }

    @DeleteMapping("/{userId}/items/{itemId}/force")
    public Mono<ResponseEntity<ShoppingCartDTO>> removeItemCompletely(
            @PathVariable UUID userId,
            @PathVariable UUID itemId) {
        return cartService.removeItemCompletely(userId, itemId)
                .map(ResponseEntity::ok);
    }

    @PutMapping("/{userId}/items")
    public Mono<ResponseEntity<ShoppingCartDTO>> updateItemQuantity(
            @PathVariable UUID userId,
            @RequestBody CartItemDTO itemDTO) {

        Integer qty = itemDTO.getQuantity();
        UUID itemId = itemDTO.getVariantId();
        if (qty == null) {
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity is required"));
        }
        if (qty < 0) {
            return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST, "Quantity must be >= 0"));
        }

        return cartService.updateItemQuantity(userId, itemId, qty)
                .map(ResponseEntity::ok);
    }

    @DeleteMapping("/{userId}")
    public Mono<ResponseEntity<ShoppingCartDTO>> clearCart(@PathVariable UUID userId) {
        return cartService.clearCart(userId)
                .map(ResponseEntity::ok);
    }
}
