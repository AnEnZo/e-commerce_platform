package com.example.voucher_service.controller;

import com.example.voucher_service.dto.UserVoucherDTO;
import com.example.voucher_service.dto.VoucherApplyRequest;
import com.example.voucher_service.dto.VoucherApplyResponse;
import com.example.voucher_service.ennum.VoucherStatus;
import com.example.voucher_service.service.UserVoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/user-vouchers")
@RequiredArgsConstructor
public class UserVoucherController {

    private final UserVoucherService userVoucherService;

    /**
     * Lấy tất cả vouchers của user
     */
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Flux<UserVoucherDTO> getUserVouchers(@PathVariable UUID userId) {
        return userVoucherService.getUserVouchers(userId);
    }

    /**
     * Lấy vouchers của user theo trạng thái
     */
    @GetMapping("/user/{userId}/status/{status}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Flux<UserVoucherDTO> getUserVouchersByStatus(
            @PathVariable UUID userId,
            @PathVariable VoucherStatus status) {
        return userVoucherService.getUserVouchersByStatus(userId, status);
    }

    /**
     * Lấy vouchers chưa sử dụng của user
     */
    @GetMapping("/user/{userId}/unused")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Flux<UserVoucherDTO> getUserUnusedVouchers(@PathVariable UUID userId) {
        return userVoucherService.getUserVouchersByStatus(userId, VoucherStatus.UNUSED);
    }

    /**
     * Lấy vouchers đã sử dụng của user
     */
    @GetMapping("/user/{userId}/used")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Flux<UserVoucherDTO> getUserUsedVouchers(@PathVariable UUID userId) {
        return userVoucherService.getUserVouchersByStatus(userId, VoucherStatus.USED);
    }

    /**
     * Lấy thông tin chi tiết một user voucher
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<UserVoucherDTO>> getUserVoucherById(@PathVariable UUID id) {
        return userVoucherService.getUserVoucherById(id)
                .map(ResponseEntity::ok)
                .onErrorResume(e -> Mono.just(ResponseEntity.notFound().build()));
    }

    /**
     * Đánh dấu voucher đã sử dụng (thường được gọi từ order service)
     */
    @PutMapping("/{id}/mark-used")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<Void>> markVoucherAsUsed(@PathVariable UUID id) {
        return userVoucherService.markVoucherAsUsed(id)
                .then(Mono.just(ResponseEntity.ok().<Void>build()))
                .onErrorResume(e -> Mono.just(ResponseEntity.status(HttpStatus.NOT_FOUND).build()));
    }

    /**
     * Đánh dấu voucher hết hạn
     */
    @PutMapping("/{id}/expire")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<Void>> expireVoucher(@PathVariable UUID id) {
        return userVoucherService.expireVoucher(id)
                .then(Mono.just(ResponseEntity.ok().<Void>build()))
                .onErrorResume(e -> Mono.just(ResponseEntity.status(HttpStatus.NOT_FOUND).build()));
    }

    @PostMapping("/apply")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<VoucherApplyResponse>> applyVoucher(@RequestBody VoucherApplyRequest request) {
        return userVoucherService.applyVoucher(request)
                .map(ResponseEntity::ok);
    }

    @PostMapping("/preview")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<VoucherApplyResponse>> previewVoucher(@RequestBody VoucherApplyRequest request) {
        return userVoucherService.previewVoucher(request)
                .map(ResponseEntity::ok);
    }

}
