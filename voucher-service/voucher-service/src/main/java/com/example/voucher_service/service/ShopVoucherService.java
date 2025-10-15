package com.example.voucher_service.service;

import com.example.voucher_service.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

public interface ShopVoucherService {

    Mono<ShopVoucherDTO> createVoucher(ShopVoucherDTO createDTO);
    Mono<ShopVoucherDTO> updateVoucher(UUID id, ShopVoucherDTO updateDTO);
    Mono<Void> deleteVoucher(UUID id);
    Mono<ShopVoucherDTO> getVoucherById(UUID id);
    Mono<ShopVoucherDTO> getVoucherByCode(String code);
    Flux<ShopVoucherDTO> getVouchersByShop(UUID shopId);
    Flux<ShopVoucherDTO> getActiveVouchersByShop(UUID shopId);
    Flux<ShopVoucherDTO> getAllVouchers(int page, int size); // simplified paging
    Mono<UserVoucherDTO> claimVoucher(UUID voucherId, UUID userId);
    Flux<ShopVoucherDTO> getActiveVouchers();
}
