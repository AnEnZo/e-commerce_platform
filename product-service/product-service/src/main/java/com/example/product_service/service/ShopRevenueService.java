package com.example.product_service.service;

import com.example.product_service.dto.ShopRevenueCreateRequest;
import com.example.product_service.dto.ShopRevenueDTO;
import com.example.product_service.dto.ShopRevenueUpdateRequest;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;


import java.time.LocalDate;
import java.util.UUID;


public interface ShopRevenueService {
    Mono<ShopRevenueDTO> createShopRevenue(ShopRevenueCreateRequest req);
    Mono<ShopRevenueDTO> updateShopRevenue(UUID id, ShopRevenueUpdateRequest req);
    Mono<Void> deleteShopRevenue(UUID id);
    Mono<ShopRevenueDTO> getById(UUID id);
    Flux<ShopRevenueDTO> findByShopId(UUID shopId);
    Flux<ShopRevenueDTO> findByShopIdAndAggregation(UUID shopId, String aggregation);
    Flux<ShopRevenueDTO> findByShopIdAndPeriodBetween(UUID shopId, LocalDate start, LocalDate end);
}