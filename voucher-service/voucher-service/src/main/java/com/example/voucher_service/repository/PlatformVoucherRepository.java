package com.example.voucher_service.repository;

import com.example.voucher_service.ennum.PlatformScope;
import com.example.voucher_service.entity.PlatformVoucher;
import org.springframework.data.domain.Pageable;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.UUID;

@Repository
public interface PlatformVoucherRepository extends R2dbcRepository<PlatformVoucher, UUID> {


    // Tìm voucher theo code
    @Query("SELECT * FROM platform_voucher WHERE code = :code")
    Mono<PlatformVoucher> findByCode(String code);

    // Paging bằng LIMIT / OFFSET. Gọi với offset = page * size
    @Query("SELECT * FROM platform_voucher ORDER BY start_at DESC LIMIT :limit OFFSET :offset")
    Flux<PlatformVoucher> findAllByOffsetLimit(int offset, int limit);

    Flux<PlatformVoucher> findByStartAtLessThanEqualAndEndAtGreaterThanEqual(LocalDateTime start, LocalDateTime end);

}
