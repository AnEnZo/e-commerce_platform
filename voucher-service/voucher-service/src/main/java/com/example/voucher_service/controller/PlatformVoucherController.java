package com.example.voucher_service.controller;

import com.example.voucher_service.dto.*;
import com.example.voucher_service.service.PlatformVoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@RestController
@RequestMapping("/api/platform-vouchers")
@RequiredArgsConstructor
public class PlatformVoucherController {

    private final PlatformVoucherService platformVoucherService;

    /**
     * Tạo voucher toàn sàn mới
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<PlatformVoucherDTO>> createVoucher(@RequestBody PlatformVoucherDTO createDTO) {
        return platformVoucherService.createVoucher(createDTO)
                .map(dto -> ResponseEntity.status(HttpStatus.CREATED).body(dto))
                .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().build()));
    }

    /**
     * Cập nhật voucher toàn sàn
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<PlatformVoucherDTO>> updateVoucher(
            @PathVariable UUID id,
            @RequestBody PlatformVoucherDTO updateDTO) {

        return platformVoucherService.updateVoucher(id, updateDTO)
                .map(ResponseEntity::ok)
                .onErrorResume(e -> Mono.just(ResponseEntity.notFound().build()));
    }

    /**
     * Xóa voucher toàn sàn
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<Void>> deleteVoucher(@PathVariable UUID id) {
        return platformVoucherService.deleteVoucher(id)
                .then(Mono.just(ResponseEntity.noContent().<Void>build()))
                .onErrorResume(e -> Mono.just(ResponseEntity.notFound().build()));
    }

    /**
     * Lấy thông tin voucher theo ID
     */
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<PlatformVoucherDTO>> getVoucherById(@PathVariable UUID id) {
        return platformVoucherService.getVoucherById(id)
                .map(ResponseEntity::ok)
                .onErrorResume(e -> Mono.just(ResponseEntity.notFound().build()));
    }

    /**
     * Lấy thông tin voucher theo mã code
     */
    @GetMapping("/code/{code}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<PlatformVoucherDTO>> getVoucherByCode(@PathVariable String code) {
        return platformVoucherService.getVoucherByCode(code)
                .map(ResponseEntity::ok)
                .onErrorResume(e -> Mono.just(ResponseEntity.notFound().build()));
    }

    /**
     * Lấy tất cả vouchers với phân trang (sử dụng page & size query params)
     * Ví dụ: GET /api/platform-vouchers?page=0&size=20
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<PageResponse<PlatformVoucherDTO>> getAllVouchers(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));
        return platformVoucherService.getAllVouchers(pageable);
    }


    /**
     * User nhận/claim voucher toàn sàn
     */
    @PostMapping("/{voucherId}/claim")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<UserVoucherDTO>> claimVoucher(
            @PathVariable UUID voucherId,
            @RequestParam UUID userId) {

        return platformVoucherService.claimVoucher(voucherId, userId)
                .map(ResponseEntity::ok)
                .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().build()));
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Flux<PlatformVoucherDTO> getActiveVouchers() {
        return platformVoucherService.getActiveVouchers();
    }

}
