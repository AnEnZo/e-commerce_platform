package com.example.product_service.service.impl;

import com.example.product_service.dto.ShopRevenueCreateRequest;
import com.example.product_service.dto.ShopRevenueDTO;
import com.example.product_service.dto.ShopRevenueUpdateRequest;
import com.example.product_service.entity.ShopRevenue;
import com.example.product_service.mapper.ShopRevenueMapper;
import com.example.product_service.repository.ShopRevenueRepository;
import com.example.product_service.service.ShopRevenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class ShopRevenueServiceImpl implements ShopRevenueService {
    private final ShopRevenueRepository repository;
    private final ShopRevenueMapper mapper;


    @Override
    public Mono<ShopRevenueDTO> createShopRevenue(ShopRevenueCreateRequest req) {
// basic validation
        if (req.getPeriodEnd().isBefore(req.getPeriodStart())) {
            return Mono.error(new IllegalArgumentException("periodEnd must be on/after periodStart"));
        }


        ShopRevenue entity = mapper.toEntity(req);
        entity.setId(UUID.randomUUID());
// compute totalNet if not provided
        BigDecimal gross = entity.getTotalGross() == null ? BigDecimal.ZERO : entity.getTotalGross();
        BigDecimal refunds = entity.getRefunds() == null ? BigDecimal.ZERO : entity.getRefunds();
        BigDecimal fees = entity.getFees() == null ? BigDecimal.ZERO : entity.getFees();
        BigDecimal net = gross.subtract(refunds).subtract(fees);
        entity.setTotalNet(net);
        entity.setCreatedAt(Instant.now());
        entity.setUpdatedAt(Instant.now());


        return repository.save(entity)
                .map(mapper::toDto);
    }

    @Override
    public Mono<ShopRevenueDTO> updateShopRevenue(UUID id, ShopRevenueUpdateRequest req) {
        return repository.findById(id)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("ShopRevenue not found: " + id)))
                .flatMap(existing -> {
                    if (req.getPeriodStart() != null) existing.setPeriodStart(req.getPeriodStart());
                    if (req.getPeriodEnd() != null) existing.setPeriodEnd(req.getPeriodEnd());
                    if (req.getAggregation() != null) existing.setAggregation(req.getAggregation());
                    if (req.getTotalGross() != null) existing.setTotalGross(req.getTotalGross());
                    if (req.getRefunds() != null) existing.setRefunds(req.getRefunds());
                    if (req.getFees() != null) existing.setFees(req.getFees());
                    if (req.getOrdersCount() != null) existing.setOrdersCount(req.getOrdersCount());
                    if (req.getCurrency() != null) existing.setCurrency(req.getCurrency());
                    if (req.getNotes() != null) existing.setNotes(req.getNotes());


// recompute totalNet
                    BigDecimal gross = existing.getTotalGross() == null ? BigDecimal.ZERO : existing.getTotalGross();
                    BigDecimal refunds = existing.getRefunds() == null ? BigDecimal.ZERO : existing.getRefunds();
                    BigDecimal fees = existing.getFees() == null ? BigDecimal.ZERO : existing.getFees();
                    existing.setTotalNet(gross.subtract(refunds).subtract(fees));
                    existing.setUpdatedAt(Instant.now());


                    return repository.save(existing);
                })
                .map(mapper::toDto);
    }


    @Override
    public Mono<Void> deleteShopRevenue(UUID id) {
        return repository.deleteById(id);
    }


    @Override
    public Mono<ShopRevenueDTO> getById(UUID id) {
        return repository.findById(id).map(mapper::toDto);
    }


    @Override
    public Flux<ShopRevenueDTO> findByShopId(UUID shopId) {
        return repository.findByShopIdOrderByPeriodStartDesc(shopId).map(mapper::toDto);
    }


    @Override
    public Flux<ShopRevenueDTO> findByShopIdAndAggregation(UUID shopId, String aggregation) {
        return repository.findByShopIdAndAggregationOrderByPeriodStartDesc(shopId, aggregation).map(mapper::toDto);
    }


    @Override
    public Flux<ShopRevenueDTO> findByShopIdAndPeriodBetween(UUID shopId, java.time.LocalDate start, java.time.LocalDate end) {
        return repository.findByShopIdAndPeriodStartBetweenOrderByPeriodStartDesc(shopId, start, end).map(mapper::toDto);
    }
}