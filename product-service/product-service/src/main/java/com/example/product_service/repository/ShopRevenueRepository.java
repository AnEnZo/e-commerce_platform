package com.example.product_service.repository;


import com.example.product_service.entity.ShopRevenue;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.util.UUID;

public interface ShopRevenueRepository extends R2dbcRepository<ShopRevenue, UUID> {
    Flux<ShopRevenue> findByShopIdOrderByPeriodStartDesc(UUID shopId);

    Flux<ShopRevenue> findByShopIdAndAggregationOrderByPeriodStartDesc(UUID shopId, String aggregation);

    // ví dụ: lấy doanh thu trong khoảng thời gian
    Flux<ShopRevenue> findByShopIdAndPeriodStartBetweenOrderByPeriodStartDesc(UUID shopId, LocalDate start, LocalDate end);

    // nếu muốn tổng hóa trực tiếp bằng query, có thể thêm @Query với SUM(...)
}
