package com.example.voucher_service.repository;

import com.example.voucher_service.ennum.VoucherStatus;
import com.example.voucher_service.entity.UserVoucher;
import org.springframework.data.r2dbc.repository.Query;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Repository
public interface UserVoucherRepository extends R2dbcRepository<UserVoucher, UUID> {

    // Tìm theo userId và platformVoucherId (nếu bạn cần list)
    @Query("SELECT * FROM user_voucher WHERE user_id = :userId AND platform_voucher_id = :platformVoucherId")
    Flux<UserVoucher> findByUserIdAndPlatformVoucherId(UUID userId, UUID platformVoucherId);

    // Kiểm tra đã tồn tại (dùng count để an toàn với R2DBC version)
    @Query("SELECT COUNT(*) FROM user_voucher WHERE user_id = :userId AND platform_voucher_id = :platformVoucherId")
    Mono<Long> countByUserIdAndPlatformVoucherId(UUID userId, UUID platformVoucherId);

    Mono<UserVoucher> findByUserIdAndShopVoucherId(UUID userId, UUID shopVoucherId);

    // Tìm 1 user-voucher (shop) theo trạng thái (dùng cho findUnusedShopUserVoucher)
    Mono<UserVoucher> findFirstByUserIdAndShopVoucherIdAndStatus(UUID userId, UUID shopVoucherId, VoucherStatus status);

    // List tất cả voucher của user
    Flux<UserVoucher> findByUserId(UUID userId);

    // List theo user và trạng thái (UNUSED/USED/EXPIRED)
    Flux<UserVoucher> findByUserIdAndStatus(UUID userId, VoucherStatus status);
}
