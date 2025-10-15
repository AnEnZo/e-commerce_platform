package com.example.voucher_service.service.serviceimpl;

import com.example.voucher_service.dto.*;
import com.example.voucher_service.entity.ShopVoucher;
import com.example.voucher_service.entity.UserVoucher;
import com.example.voucher_service.ennum.DiscountType;
import com.example.voucher_service.ennum.VoucherStatus;
import com.example.voucher_service.mapper.ShopVoucherMapper;
import com.example.voucher_service.mapper.UserVoucherMapper;
import com.example.voucher_service.repository.ShopVoucherRepository;
import com.example.voucher_service.repository.UserVoucherRepository;
import com.example.voucher_service.service.ShopVoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShopVoucherServiceImpl implements ShopVoucherService {

    private final ShopVoucherRepository shopVoucherRepository;
    private final UserVoucherRepository userVoucherRepository;
    private final ShopVoucherMapper shopVoucherMapper;
    private final UserVoucherMapper userVoucherMapper;

    @Override
    public Mono<ShopVoucherDTO> createVoucher(ShopVoucherDTO createDTO) {
        ShopVoucher voucher = shopVoucherMapper.toEntity(createDTO);
        voucher.setUsedCount(0);
        return shopVoucherRepository.save(voucher)
                .map(shopVoucherMapper::toDTO);
    }

    @Override
    public Mono<ShopVoucherDTO> updateVoucher(UUID id, ShopVoucherDTO updateDTO) {
        return shopVoucherRepository.findById(id)
                .switchIfEmpty(Mono.error(new RuntimeException("Voucher not found")))
                .flatMap(existing -> {
                    shopVoucherMapper.updateEntityFromDTO(updateDTO, existing);
                    return shopVoucherRepository.save(existing);
                })
                .map(shopVoucherMapper::toDTO);
    }

    @Override
    public Mono<Void> deleteVoucher(UUID id) {
        return shopVoucherRepository.deleteById(id);
    }

    @Override
    public Mono<ShopVoucherDTO> getVoucherById(UUID id) {
        return shopVoucherRepository.findById(id)
                .switchIfEmpty(Mono.error(new RuntimeException("Voucher not found")))
                .map(shopVoucherMapper::toDTO);
    }

    @Override
    public Mono<ShopVoucherDTO> getVoucherByCode(String code) {
        return shopVoucherRepository.findByCode(code)
                .switchIfEmpty(Mono.error(new RuntimeException("Voucher not found")))
                .map(shopVoucherMapper::toDTO);
    }

    @Override
    public Flux<ShopVoucherDTO> getVouchersByShop(UUID shopId) {
        return shopVoucherRepository.findByShopId(shopId)
                .map(shopVoucherMapper::toDTO);
    }

    @Override
    public Flux<ShopVoucherDTO> getActiveVouchersByShop(UUID shopId) {
        LocalDateTime now = LocalDateTime.now();
        return shopVoucherRepository
                .findByShopIdAndStartAtLessThanEqualAndEndAtGreaterThanEqual(shopId, now, now)
                .map(shopVoucherMapper::toDTO);
    }

    @Override
    public Flux<ShopVoucherDTO> getAllVouchers(int page, int size) {
        int skip = page * size;
        return shopVoucherRepository.findAll()
                .skip(skip)
                .take(size)
                .map(shopVoucherMapper::toDTO);
    }

    // Reactive transactional methods — @Transactional works with R2dbcTransactionManager
    @Override
    @Transactional
    public Mono<UserVoucherDTO> claimVoucher(UUID voucherId, UUID userId) {
        LocalDateTime now = LocalDateTime.now();
        return shopVoucherRepository.findById(voucherId)
                .switchIfEmpty(Mono.error(new RuntimeException("Voucher not found")))
                .flatMap(voucher -> {
                    if (voucher.getStartAt().isAfter(now) || voucher.getEndAt().isBefore(now)) {
                        return Mono.error(new RuntimeException("Voucher is not active"));
                    }
                    if (voucher.getUsageLimit() != null && voucher.getUsedCount() >= voucher.getUsageLimit()) {
                        return Mono.error(new RuntimeException("Voucher usage limit exceeded"));
                    }
                    return userVoucherRepository.findByUserIdAndShopVoucherId(userId, voucherId)
                            .hasElement()
                            .flatMap(exists -> {
                                if (exists) return Mono.<UserVoucherDTO>error(new RuntimeException("User already claimed this voucher"));

                                UserVoucher userVoucher = UserVoucher.builder()
                                        .shopVoucherId(voucherId)
                                        .userId(userId)
                                        .status(VoucherStatus.UNUSED)
                                        .issuedAt(now)
                                        .expireAt(voucher.getEndAt())
                                        .build();
                                return userVoucherRepository.save(userVoucher)
                                        .map(userVoucherMapper::toDTO);
                            });
                });
    }

    @Override
    public Flux<ShopVoucherDTO> getActiveVouchers() {
        LocalDateTime now = LocalDateTime.now();
        return shopVoucherRepository
                .findByStartAtLessThanEqualAndEndAtGreaterThanEqual(now, now)
                .map(shopVoucherMapper::toDTO);
    }



}
