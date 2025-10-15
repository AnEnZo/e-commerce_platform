package com.example.voucher_service.service.serviceimpl;

import com.example.voucher_service.dto.*;
import com.example.voucher_service.entity.PlatformVoucher;
import com.example.voucher_service.entity.UserVoucher;
import com.example.voucher_service.ennum.DiscountType;
import com.example.voucher_service.ennum.PlatformScope;
import com.example.voucher_service.ennum.VoucherStatus;
import com.example.voucher_service.mapper.PlatformVoucherMapper;
import com.example.voucher_service.mapper.UserVoucherMapper;
import com.example.voucher_service.repository.PlatformVoucherRepository;
import com.example.voucher_service.repository.UserVoucherRepository;
import com.example.voucher_service.service.PlatformVoucherService;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.reactive.TransactionalOperator;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PlatformVoucherServiceImpl implements PlatformVoucherService {

    private final PlatformVoucherRepository platformVoucherRepository;
    private final UserVoucherRepository userVoucherRepository;
    private final PlatformVoucherMapper platformVoucherMapper;
    private final UserVoucherMapper userVoucherMapper;
    private final TransactionalOperator transactionalOperator;

    // --- Create voucher (returns created DTO) ---
    @Override
    public Mono<PlatformVoucherDTO> createVoucher(PlatformVoucherDTO createDTO) {
        PlatformVoucher voucher = platformVoucherMapper.toEntity(createDTO);
        voucher.setUsedCount(0);
        return platformVoucherRepository.save(voucher)
                .map(platformVoucherMapper::toDTO);
    }

    // --- Update voucher ---
    @Override
    public Mono<PlatformVoucherDTO> updateVoucher(UUID id, PlatformVoucherDTO updateDTO) {
        return platformVoucherRepository.findById(id)
                .switchIfEmpty(Mono.error(new RuntimeException("Voucher not found")))
                .flatMap(existing -> {
                    platformVoucherMapper.updateEntityFromDTO(updateDTO, existing);
                    return platformVoucherRepository.save(existing);
                })
                .map(platformVoucherMapper::toDTO);
    }

    // --- Delete voucher ---
    @Override
    public Mono<Void> deleteVoucher(UUID id) {
        return platformVoucherRepository.deleteById(id);
    }

    // --- Get by id ---
    @Override
    public Mono<PlatformVoucherDTO> getVoucherById(UUID id) {
        return platformVoucherRepository.findById(id)
                .switchIfEmpty(Mono.error(new RuntimeException("Voucher not found")))
                .map(platformVoucherMapper::toDTO);
    }

    // --- Get by code ---
    @Override
    public Mono<PlatformVoucherDTO> getVoucherByCode(String code) {
        return platformVoucherRepository.findByCode(code)
                .switchIfEmpty(Mono.error(new RuntimeException("Voucher not found")))
                .map(platformVoucherMapper::toDTO);
    }

    @Override
    public Mono<PageResponse<PlatformVoucherDTO>> getAllVouchers(Pageable pageable) {
        int page = pageable.getPageNumber();
        int size = pageable.getPageSize();
        int offset = page * size;

        Flux<PlatformVoucherDTO> contentFlux = platformVoucherRepository
                .findAllByOffsetLimit(offset, size)
                .map(platformVoucherMapper::toDTO);

        Mono<Long> totalMono = platformVoucherRepository.count();

        return Mono.zip(contentFlux.collectList(), totalMono)
                .map(tuple -> {
                    List<PlatformVoucherDTO> content = tuple.getT1();
                    long total = tuple.getT2();
                    int totalPages = size == 0 ? 0 : (int) Math.ceil((double) total / size);

                    return new PageResponse<>(
                            content,
                            total,
                            page,
                            size,
                            totalPages
                    );
                });
    }


    // --- Claim voucher: create UserVoucher (transactional to avoid race on duplicate claim) ---
    @Override
    public Mono<UserVoucherDTO> claimVoucher(UUID voucherId, UUID userId) {
        LocalDateTime now = LocalDateTime.now();

        Mono<UserVoucherDTO> workflow = platformVoucherRepository.findById(voucherId)
                .switchIfEmpty(Mono.error(new RuntimeException("Voucher not found")))
                .flatMap(voucher -> {
                    // Check active
                    if (voucher.getStartAt().isAfter(now) || voucher.getEndAt().isBefore(now)) {
                        return Mono.error(new RuntimeException("Voucher is not active"));
                    }
                    // Check usage limit
                    if (voucher.getUsageLimit() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
                        return Mono.error(new RuntimeException("Voucher usage limit exceeded"));
                    }
                    // Check if user already claimed this voucher
                    return userVoucherRepository.findByUserIdAndPlatformVoucherId(userId, voucherId)
                            .collectList()
                            .flatMap(existing -> {
                                if (!existing.isEmpty()) {
                                    return Mono.error(new RuntimeException("User already claimed this voucher"));
                                }
                                UserVoucher userVoucher = UserVoucher.builder()
                                        .platformVoucherId(voucherId)
                                        .userId(userId)
                                        .status(VoucherStatus.UNUSED)
                                        .issuedAt(now)
                                        .expireAt(voucher.getEndAt())
                                        .build();
                                return userVoucherRepository.save(userVoucher)
                                        .map(userVoucherMapper::toDTO);
                            });
                });

        // Wrap in reactive transaction to ensure consistency (e.g., duplicates)
        return transactionalOperator.transactional(workflow);
    }

    @Override
    public Flux<PlatformVoucherDTO> getActiveVouchers() {
        LocalDateTime now = LocalDateTime.now();
        return platformVoucherRepository
                .findByStartAtLessThanEqualAndEndAtGreaterThanEqual(now, now)
                .map(platformVoucherMapper::toDTO);
    }

}