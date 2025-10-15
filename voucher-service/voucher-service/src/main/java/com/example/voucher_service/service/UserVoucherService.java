package com.example.voucher_service.service;

import com.example.voucher_service.dto.UserVoucherDTO;
import com.example.voucher_service.dto.VoucherApplyRequest;
import com.example.voucher_service.dto.VoucherApplyResponse;
import com.example.voucher_service.ennum.VoucherStatus;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface UserVoucherService {

    Flux<UserVoucherDTO> getUserVouchers(UUID userId);

    Flux<UserVoucherDTO> getUserVouchersByStatus(UUID userId, VoucherStatus status);

    Mono<UserVoucherDTO> getUserVoucherById(UUID id);

    Mono<Void> markVoucherAsUsed(UUID userVoucherId);

    Mono<Void> expireVoucher(UUID userVoucherId);

    Mono<VoucherApplyResponse> applyVoucher(VoucherApplyRequest request);

    Mono<VoucherApplyResponse> previewVoucher(VoucherApplyRequest request);
}
