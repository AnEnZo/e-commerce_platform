package com.example.product_service.controller;

import com.example.product_service.dto.ShopRevenueCreateRequest;
import com.example.product_service.dto.ShopRevenueDTO;
import com.example.product_service.dto.ShopRevenueUpdateRequest;
import com.example.product_service.service.ShopRevenueService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.time.LocalDate;
import java.util.UUID;


@RestController
@RequestMapping("/api/revenues")
@RequiredArgsConstructor
@Validated
public class ShopRevenueController {
    private final ShopRevenueService service;


    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<ShopRevenueDTO> create(@Valid @RequestBody ShopRevenueCreateRequest req) {
        return service.createShopRevenue(req);
    }


    @GetMapping("/{id}")
    public Mono<ShopRevenueDTO> getById(@PathVariable UUID id) {
        return service.getById(id);
    }


    @GetMapping("/shop/{shopId}")
    public Flux<ShopRevenueDTO> getByShop(@PathVariable UUID shopId,
                                          @RequestParam(required = false) String aggregation,
                                          @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
                                          @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        if (aggregation != null) {
            return service.findByShopIdAndAggregation(shopId, aggregation);
        }
        if (from != null && to != null) {
            return service.findByShopIdAndPeriodBetween(shopId, from, to);
        }
        return service.findByShopId(shopId);
    }


    @PutMapping("/{id}")
    public Mono<ShopRevenueDTO> update(@PathVariable UUID id, @Valid @RequestBody ShopRevenueUpdateRequest req) {
        return service.updateShopRevenue(id, req);
    }


    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> delete(@PathVariable UUID id) {
        return service.deleteShopRevenue(id);
    }
}