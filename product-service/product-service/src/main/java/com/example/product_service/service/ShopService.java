package com.example.product_service.service;

import com.example.product_service.dto.PageResponse;
import com.example.product_service.dto.ShopDTO;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

public interface ShopService {
    Mono<ShopDTO> create(ShopDTO dto);
    Mono<ShopDTO> getById(UUID id);
    Mono<PageResponse<ShopDTO>> getAll(int page, int size);
    Mono<ShopDTO> update(UUID id, ShopDTO dto);
    Mono<Void> delete(UUID id);
    Mono<ShopDTO> getByOwnerId(UUID ownerId);

}
