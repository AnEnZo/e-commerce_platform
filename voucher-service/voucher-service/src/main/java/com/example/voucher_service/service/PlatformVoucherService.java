package com.example.voucher_service.service;

import com.example.voucher_service.dto.*;
import com.example.voucher_service.entity.PlatformVoucher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

public interface PlatformVoucherService {

    Mono<PlatformVoucherDTO> createVoucher(PlatformVoucherDTO createDTO);

    Mono<PlatformVoucherDTO> updateVoucher(UUID id, PlatformVoucherDTO updateDTO);

    Mono<Void> deleteVoucher(UUID id);

    Mono<PlatformVoucherDTO> getVoucherById(UUID id);

    Mono<PlatformVoucherDTO> getVoucherByCode(String code);

    Mono<PageResponse<PlatformVoucherDTO>> getAllVouchers(Pageable pageable);

    Mono<UserVoucherDTO> claimVoucher(UUID voucherId, UUID userId);

    Flux<PlatformVoucherDTO> getActiveVouchers();

}