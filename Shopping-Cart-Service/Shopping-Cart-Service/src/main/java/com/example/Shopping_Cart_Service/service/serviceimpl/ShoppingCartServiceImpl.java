package com.example.Shopping_Cart_Service.service.serviceimpl;

import com.example.Shopping_Cart_Service.client.ProductServiceClient;
import com.example.Shopping_Cart_Service.dto.CartItemDTO;
import com.example.Shopping_Cart_Service.dto.ProductVariantInfo;
import com.example.Shopping_Cart_Service.dto.ShoppingCartDTO;
import com.example.Shopping_Cart_Service.entity.CartItem;
import com.example.Shopping_Cart_Service.entity.ShoppingCart;
import com.example.Shopping_Cart_Service.mapper.ShoppingCartMapper;
import com.example.Shopping_Cart_Service.repository.CartItemRepository;
import com.example.Shopping_Cart_Service.repository.ShoppingCartRepository;
import com.example.Shopping_Cart_Service.service.ShoppingCartService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Mono;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShoppingCartServiceImpl implements ShoppingCartService {

    private final ShoppingCartRepository cartRepository;
    private final CartItemRepository itemRepository;
    private final ShoppingCartMapper mapper;
    private final ProductServiceClient productServiceClient;

    // --- READ: get cart + items + enrich product info
    @Override
    public Mono<ShoppingCartDTO> getCartByUserId(UUID userId) {
        return cartRepository.findByUserId(userId)
                .switchIfEmpty(createCartEntityReactive(userId))
                .flatMap(cart ->
                        itemRepository.findByCartId(cart.getId())
                                .collectList()
                                .flatMap(items -> enrichAndBuildDto(cart, items))
                );
    }

    // --- ADD item
    @Override
    @Transactional
    public Mono<ShoppingCartDTO> addItemToCart(UUID userId, CartItemDTO itemDTO) {
        return cartRepository.findByUserId(userId)
                .switchIfEmpty(createCartEntityReactive(userId))
                .flatMap(cart -> itemRepository.findByCartIdAndVariantId(cart.getId(), itemDTO.getVariantId())
                        .flatMap(existingItem -> {
                            existingItem.setQuantity(existingItem.getQuantity() + itemDTO.getQuantity());
                            return itemRepository.save(existingItem);
                        })
                        .switchIfEmpty(Mono.defer(() -> {
                            CartItem newItem = CartItem.builder()
                                    .cartId(cart.getId())
                                    .variantId(itemDTO.getVariantId())
                                    .quantity(itemDTO.getQuantity())
                                    .build();
                            return itemRepository.save(newItem);
                        }))
                        .then(itemRepository.findByCartId(cart.getId())
                                .sort(Comparator.comparing(CartItem::getCreatedAt))
                                .collectList()
                                .flatMap(items -> enrichAndBuildDto(cart, items)))
                );
    }

    // --- REMOVE item by itemId
    @Override
    @Transactional
    public Mono<ShoppingCartDTO> removeItemFromCart(UUID userId, UUID itemId) {
        return cartRepository.findByUserId(userId)
                .switchIfEmpty(Mono.error(new RuntimeException("Cart not found")))
                .flatMap(cart ->
                        itemRepository.findByCartIdAndVariantId(cart.getId(), itemId)
                                .flatMap(existing -> {
                                    if (!existing.getCartId().equals(cart.getId())) {
                                        return Mono.error(new RuntimeException("Item does not belong to user's cart"));
                                    }

                                    // Nếu quantity > 1 thì trừ đi 1
                                    if (existing.getQuantity() > 1) {
                                        existing.setQuantity(existing.getQuantity() - 1);
                                        return itemRepository.save(existing).thenReturn(existing);
                                    } else {
                                        // Nếu quantity = 1 thì xóa luôn
                                        return itemRepository.deleteById(itemId).then(Mono.empty());
                                    }
                                })
                                .then(itemRepository.findByCartId(cart.getId())
                                .sort(Comparator.comparing(CartItem::getCreatedAt))
                                .collectList())
                                .flatMap(items -> enrichAndBuildDto(cart, items))
                );
    }



    // --- CLEAR cart (delete all cart items)
    @Override
    @Transactional
    public Mono<ShoppingCartDTO> clearCart(UUID userId) {
        return cartRepository.findByUserId(userId)
                .switchIfEmpty(Mono.error(new RuntimeException("Cart not found")))
                .flatMap(cart ->
                        itemRepository.findByCartId(cart.getId())
                                .flatMap(item -> itemRepository.deleteById(item.getId()))
                                .then(itemRepository.findByCartId(cart.getId()).collectList())
                                .flatMap(items -> enrichAndBuildDto(cart, items))
                );
    }

    // --- CREATE cart manually (exposed)
    @Override
    public Mono<ShoppingCartDTO> createCart(UUID userId) {
        return cartRepository.findByUserId(userId)
                .map(existing -> mapper.toCartDTO(existing, Collections.emptyList()))
                .switchIfEmpty(
                        createCartEntityReactive(userId)
                                .map(cart -> mapper.toCartDTO(cart, Collections.emptyList()))
                );
    }

    // --- helper: create cart entity and save (reactive, returns Mono<ShoppingCart>)
    private Mono<ShoppingCart> createCartEntityReactive(UUID userId) {
        ShoppingCart newCart = ShoppingCart.builder()
                .userId(userId)
                .build();
        return cartRepository.save(newCart);
    }

    // --- helper: build DTO and enrich items with product info
    private Mono<ShoppingCartDTO> enrichAndBuildDto(ShoppingCart cart, List<CartItem> items) {
        List<UUID> variantIds = items.stream()
                .map(CartItem::getVariantId)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());

        Mono<List<ProductVariantInfo>> infosMono = variantIds.isEmpty()
                ? Mono.just(Collections.emptyList())
                : productServiceClient.getVariantsInfo(variantIds);

        return infosMono.map(infos -> {
            Map<UUID, ProductVariantInfo> infoMap = infos.stream()
                    .collect(Collectors.toMap(ProductVariantInfo::getVariantId, i -> i));

            List<CartItemDTO> itemDTOs = items.stream().map(it -> {
                CartItemDTO dto = mapper.toCartItemDTO(it);
                ProductVariantInfo info = infoMap.get(it.getVariantId());
                if (info != null) {
                    dto.setProductName(info.getProductName());
                    dto.setProductImageUrl(info.getImageUrl());
                    dto.setShopName(info.getShopName());
                    dto.setShopId(info.getShopId());
                    dto.setColor(info.getColor());
                    dto.setSize(info.getSize());
                }
                return dto;
            }).collect(Collectors.toList());

            return mapper.toCartDTO(cart, itemDTOs);
        });
    }


    // --- REMOVE item completely (delete regardless of quantity)
    @Override
    @Transactional
    public Mono<ShoppingCartDTO> removeItemCompletely(UUID userId, UUID itemId) {
        return cartRepository.findByUserId(userId)
                .switchIfEmpty(Mono.error(new RuntimeException("Cart not found")))
                .flatMap(cart ->
                        itemRepository.findById(itemId)
                                .flatMap(existing -> {
                                    if (!existing.getCartId().equals(cart.getId())) {
                                        return Mono.error(new RuntimeException("Item does not belong to user's cart"));
                                    }
                                    return itemRepository.deleteById(itemId);
                                })
                                .then(itemRepository.findByCartId(cart.getId()).collectList())
                                .flatMap(items -> enrichAndBuildDto(cart, items))
                );
    }

    // --- UPDATE item quantity (set to given quantity). If quantity <= 0 => delete item.
    @Override
    @Transactional
    public Mono<ShoppingCartDTO> updateItemQuantity(UUID userId, UUID itemId, int quantity) {
        return cartRepository.findByUserId(userId)
                .switchIfEmpty(Mono.error(new RuntimeException("Cart not found")))
                .flatMap(cart ->
                        itemRepository.findById(itemId)
                                .flatMap(existing -> {
                                    if (!existing.getCartId().equals(cart.getId())) {
                                        return Mono.error(new RuntimeException("Item does not belong to user's cart"));
                                    }
                                    if (quantity <= 0) {
                                        // remove item if user sets non-positive quantity
                                        return itemRepository.deleteById(itemId).then(Mono.empty());
                                    } else {
                                        existing.setQuantity(quantity);
                                        return itemRepository.save(existing).thenReturn(existing);
                                    }
                                })
                                .then(itemRepository.findByCartId(cart.getId()).collectList())
                                .flatMap(items -> enrichAndBuildDto(cart, items))
                );
    }

}
