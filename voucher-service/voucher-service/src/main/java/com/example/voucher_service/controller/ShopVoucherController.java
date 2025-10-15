package com.example.voucher_service.controller;

import com.example.voucher_service.dto.*;
import com.example.voucher_service.service.ShopVoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@RestController
@RequestMapping("/api/shop-vouchers")
@RequiredArgsConstructor
public class ShopVoucherController {

    private final ShopVoucherService shopVoucherService;

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public Mono<ResponseEntity<ShopVoucherDTO>> createVoucher(@RequestBody ShopVoucherDTO createDTO) {
        return shopVoucherService.createVoucher(createDTO)
                .map(dto -> ResponseEntity.status(HttpStatus.CREATED).body(dto))
                .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().build()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public Mono<ResponseEntity<ShopVoucherDTO>> updateVoucher(
            @PathVariable UUID id,
            @RequestBody ShopVoucherDTO updateDTO) {
        return shopVoucherService.updateVoucher(id, updateDTO)
                .map(ResponseEntity::ok)
                .onErrorResume(e -> Mono.just(ResponseEntity.notFound().build()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN')")
    public Mono<ResponseEntity<Void>> deleteVoucher(@PathVariable UUID id) {
        return shopVoucherService.deleteVoucher(id)
                .thenReturn(ResponseEntity.noContent().<Void>build())
                .onErrorResume(e -> Mono.just(ResponseEntity.notFound().build()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<ShopVoucherDTO>> getVoucherById(@PathVariable UUID id) {
        return shopVoucherService.getVoucherById(id)
                .map(ResponseEntity::ok)
                .onErrorResume(e -> Mono.just(ResponseEntity.notFound().build()));
    }

    @GetMapping("/code/{code}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<ShopVoucherDTO>> getVoucherByCode(@PathVariable String code) {
        return shopVoucherService.getVoucherByCode(code)
                .map(ResponseEntity::ok)
                .onErrorResume(e -> Mono.just(ResponseEntity.notFound().build()));
    }

    @GetMapping("/shop/{shopId}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Flux<ShopVoucherDTO> getVouchersByShop(@PathVariable UUID shopId) {
        return shopVoucherService.getVouchersByShop(shopId);
    }

    @GetMapping("/shop/{shopId}/active")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Flux<ShopVoucherDTO> getActiveVouchersByShop(@PathVariable UUID shopId) {
        return shopVoucherService.getActiveVouchersByShop(shopId);
    }

    // simplified reactive paging: /api/shop-vouchers?page=0&size=20
    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Flux<ShopVoucherDTO> getAllVouchers(@RequestParam(defaultValue = "0") int page,
                                               @RequestParam(defaultValue = "20") int size) {
        return shopVoucherService.getAllVouchers(page, size);
    }

    @PostMapping("/{voucherId}/claim")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<UserVoucherDTO>> claimVoucher(
            @PathVariable UUID voucherId,
            @RequestParam UUID userId) {
        return shopVoucherService.claimVoucher(voucherId, userId)
                .map(ResponseEntity::ok)
                .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().build()));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Flux<ShopVoucherDTO> getAllActiveShopVouchers() {
        return shopVoucherService.getActiveVouchers();
    }

}
