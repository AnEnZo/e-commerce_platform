package com.example.voucher_service.repository;

import com.example.voucher_service.entity.ShopVoucher;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface ShopVoucherRepository extends R2dbcRepository<ShopVoucher, UUID> {

    // nếu code là duy nhất -> Mono
    Mono<ShopVoucher> findByCode(String code);

    // list theo shop -> Flux
    Flux<ShopVoucher> findByShopId(UUID shopId);

    // lấy voucher của shop mà thời gian bắt đầu <= now <= thời gian kết thúc
    Flux<ShopVoucher> findByShopIdAndStartAtLessThanEqualAndEndAtGreaterThanEqual(
            UUID shopId, LocalDateTime startAt, LocalDateTime endAt);

    Flux<ShopVoucher> findByStartAtLessThanEqualAndEndAtGreaterThanEqual(LocalDateTime start, LocalDateTime end);

}
