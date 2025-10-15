package com.example.voucher_service.service.serviceimpl;

import com.example.voucher_service.dto.UserVoucherDTO;
import com.example.voucher_service.dto.VoucherApplyRequest;
import com.example.voucher_service.dto.VoucherApplyResponse;
import com.example.voucher_service.ennum.DiscountType;
import com.example.voucher_service.ennum.PlatformScope;
import com.example.voucher_service.ennum.VoucherStatus;
import com.example.voucher_service.entity.UserVoucher;
import com.example.voucher_service.mapper.UserVoucherMapper;
import com.example.voucher_service.repository.PlatformVoucherRepository;
import com.example.voucher_service.repository.ShopVoucherRepository;
import com.example.voucher_service.repository.UserVoucherRepository;
import com.example.voucher_service.service.UserVoucherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.reactive.TransactionalOperator;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserVoucherServiceImpl implements UserVoucherService {

    private final UserVoucherRepository userVoucherRepository;
    private final UserVoucherMapper userVoucherMapper;
    private final ShopVoucherRepository shopVoucherRepository;
    private final PlatformVoucherRepository platformVoucherRepository;
    private final TransactionalOperator transactionalOperator;

    // -------------------------
    // Basic CRUD-like methods
    // -------------------------
    @Override
    public Flux<UserVoucherDTO> getUserVouchers(UUID userId) {
        return userVoucherRepository.findByUserId(userId)
                .map(userVoucherMapper::toDTO);
    }

    @Override
    public Flux<UserVoucherDTO> getUserVouchersByStatus(UUID userId, VoucherStatus status) {
        return userVoucherRepository.findByUserIdAndStatus(userId, status)
                .map(userVoucherMapper::toDTO);
    }

    @Override
    public Mono<UserVoucherDTO> getUserVoucherById(UUID id) {
        return userVoucherRepository.findById(id)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "User voucher not found")))
                .map(userVoucherMapper::toDTO);
    }

    @Override
    public Mono<Void> markVoucherAsUsed(UUID userVoucherId) {
        return userVoucherRepository.findById(userVoucherId)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "User voucher not found")))
                .flatMap(uv -> {
                    uv.setStatus(VoucherStatus.USED);
                    uv.setUsedAt(LocalDateTime.now());
                    return userVoucherRepository.save(uv);
                })
                .then();
    }

    @Override
    public Mono<Void> expireVoucher(UUID userVoucherId) {
        return userVoucherRepository.findById(userVoucherId)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "User voucher not found")))
                .flatMap(uv -> {
                    uv.setStatus(VoucherStatus.EXPIRED);
                    return userVoucherRepository.save(uv);
                })
                .then();
    }

    // -------------------------
    // Apply / Preview entrypoints
    // -------------------------
    @Override
    public Mono<VoucherApplyResponse> applyVoucher(VoucherApplyRequest request) {
        boolean hasShopId = request.getVoucherShopId() != null;
        boolean hasPlatformId = request.getVoucherPlatformId() != null;

        if (hasShopId && hasPlatformId) {
            return transactionalOperator.transactional(applyCombinedWorkflow(request));
        }

        if (request.getVoucherPlatformId() !=null || hasPlatformId) {
            return transactionalOperator.transactional(applyPlatformWorkflow(request));
        } else if (request.getVoucherShopId() != null || hasShopId) {
            return transactionalOperator.transactional(applyShopWorkflow(request));
        } else {
            return Mono.just(VoucherApplyResponse.builder()
                    .success(false)
                    .message("Invalid voucher type or no voucher code provided")
                    .build());
        }
    }

    @Override
    public Mono<VoucherApplyResponse> previewVoucher(VoucherApplyRequest request) {
        boolean hasShopId = request.getVoucherShopId() != null;
        boolean hasPlatformId = request.getVoucherPlatformId() != null;

        if (hasShopId && hasPlatformId) {
            return previewCombinedWorkflow(request);
        }

        if (request.getVoucherPlatformId() !=null || hasPlatformId) {
            return previewPlatformWorkflow(request);
        } else if (request.getVoucherShopId() != null || hasShopId) {
            return previewShopWorkflow(request);
        } else {
            return Mono.just(VoucherApplyResponse.builder()
                    .success(false)
                    .message("Invalid voucher type")
                    .build());
        }
    }

    // -------------------------
    // Helpers
    // -------------------------
    private BigDecimal calcDiscount(BigDecimal baseAmount, DiscountType discountType, BigDecimal discountValue) {
        if (baseAmount == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        if (discountType == DiscountType.PERCENTAGE) {
            return baseAmount.multiply(discountValue)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP)
                    .setScale(2, RoundingMode.HALF_UP);
        } else {
            return discountValue == null ? BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP)
                    : discountValue.setScale(2, RoundingMode.HALF_UP);
        }
    }

    private Mono<UserVoucher> findUnusedShopUserVoucher(UUID userId, UUID shopVoucherId) {
        return userVoucherRepository.findFirstByUserIdAndShopVoucherIdAndStatus(userId, shopVoucherId, VoucherStatus.UNUSED)
                .switchIfEmpty(Mono.justOrEmpty(null));
    }

    private Mono<UserVoucher> findUnusedPlatformUserVoucher(UUID userId, UUID platformVoucherId) {
        return userVoucherRepository.findByUserIdAndPlatformVoucherId(userId, platformVoucherId)
                .filter(uv -> uv.getStatus() == VoucherStatus.UNUSED)
                .next()
                .switchIfEmpty(Mono.justOrEmpty(null));
    }

    private Mono<VoucherApplyResponse> bad(String msg) {
        return Mono.just(VoucherApplyResponse.builder().success(false).message(msg).build());
    }

    private Mono<VoucherApplyResponse> ok(BigDecimal discountAmount, BigDecimal finalAmount, String message) {
        return Mono.just(VoucherApplyResponse.builder()
                .success(true)
                .message(message)
                .discountAmount(discountAmount.setScale(2, RoundingMode.HALF_UP))
                .finalAmount(finalAmount.setScale(2, RoundingMode.HALF_UP))
                .build());
    }

    // -------------------------
    // Apply Workflows
    // -------------------------
    private Mono<VoucherApplyResponse> applyCombinedWorkflow(VoucherApplyRequest request) {
        LocalDateTime now = LocalDateTime.now();

        if (request.getOrderAmount() == null) {
            return bad("Order amount is required for combined voucher application");
        }

        BigDecimal originalAmount = request.getOrderAmount().setScale(2, RoundingMode.HALF_UP);

        return shopVoucherRepository.findById(request.getVoucherShopId())
                .flatMap(shopVoucher -> {
                    if (shopVoucher.getStartAt().isAfter(now) || shopVoucher.getEndAt().isBefore(now)) {
                        return bad("Shop voucher is not active");
                    }
                    if (shopVoucher.getMinOrderAmount() != null
                            && originalAmount.compareTo(shopVoucher.getMinOrderAmount()) < 0) {
                        return bad("Order amount below shop voucher minimum: " + shopVoucher.getMinOrderAmount().setScale(2, RoundingMode.HALF_UP));
                    }

                    Mono<UserVoucher> shopUserVoucherMono =
                            findUnusedShopUserVoucher(request.getUserId(), shopVoucher.getId());

                    return platformVoucherRepository.findById(request.getVoucherPlatformId())
                            .flatMap(platformVoucher -> {
                                if (platformVoucher.getStartAt().isAfter(now) || platformVoucher.getEndAt().isBefore(now)) {
                                    return bad("Platform voucher is not active");
                                }

                                Mono<UserVoucher> platformUserVoucherMono =
                                        findUnusedPlatformUserVoucher(request.getUserId(), platformVoucher.getId());

                                return Mono.zip(shopUserVoucherMono, platformUserVoucherMono)
                                        .flatMap(tuple -> {
                                            UserVoucher shopUserVoucher = tuple.getT1();
                                            UserVoucher platformUserVoucher = tuple.getT2();

                                            if (shopUserVoucher == null) return bad("User does not have the shop voucher or it's already used");
                                            if (platformUserVoucher == null) return bad("User does not have the platform voucher or it's already used");

                                            BigDecimal shopDiscount = calcDiscount(originalAmount, shopVoucher.getDiscountType(), shopVoucher.getDiscountValue());
                                            BigDecimal afterShop = originalAmount.subtract(shopDiscount);
                                            if (afterShop.compareTo(BigDecimal.ZERO) < 0) afterShop = BigDecimal.ZERO;
                                            afterShop = afterShop.setScale(2, RoundingMode.HALF_UP);

                                            if (platformVoucher.getMinOrderAmount() != null
                                                    && afterShop.compareTo(platformVoucher.getMinOrderAmount()) < 0) {
                                                return bad("Amount after shop voucher below platform voucher minimum: " + platformVoucher.getMinOrderAmount().setScale(2, RoundingMode.HALF_UP));
                                            }

                                            BigDecimal platformDiscount = calcDiscount(afterShop, platformVoucher.getDiscountType(), platformVoucher.getDiscountValue());
                                            BigDecimal finalAmount = afterShop.subtract(platformDiscount);
                                            if (finalAmount.compareTo(BigDecimal.ZERO) < 0) finalAmount = BigDecimal.ZERO;
                                            finalAmount = finalAmount.setScale(2, RoundingMode.HALF_UP);

                                            // cập nhật trạng thái và usedCount
                                            shopUserVoucher.setStatus(VoucherStatus.USED);
                                            shopUserVoucher.setUsedAt(LocalDateTime.now());

                                            platformUserVoucher.setStatus(VoucherStatus.USED);
                                            platformUserVoucher.setUsedAt(LocalDateTime.now());

                                            shopVoucher.setUsedCount(shopVoucher.getUsedCount() == null ? 1 : shopVoucher.getUsedCount() + 1);
                                            platformVoucher.setUsedCount(platformVoucher.getUsedCount() == null ? 1 : platformVoucher.getUsedCount() + 1);

                                            return userVoucherRepository.save(shopUserVoucher)
                                                    .then(userVoucherRepository.save(platformUserVoucher))
                                                    .then(shopVoucherRepository.save(shopVoucher))
                                                    .then(platformVoucherRepository.save(platformVoucher))
                                                    .then(ok(shopDiscount.add(platformDiscount), finalAmount, "Both vouchers applied successfully"));
                                        });
                            })
                            .switchIfEmpty(bad("Platform voucher not found"));
                })
                .switchIfEmpty(bad("Shop voucher not found"));
    }

    private Mono<VoucherApplyResponse> applyPlatformWorkflow(VoucherApplyRequest request) {
        LocalDateTime now = LocalDateTime.now();

        // NOTE: dùng voucherPlatformCode để tìm platform voucher
        return platformVoucherRepository.findById(request.getVoucherPlatformId())
                .flatMap(voucher -> {
                    if (voucher.getStartAt().isAfter(now) || voucher.getEndAt().isBefore(now)) {
                        return bad("Voucher not active");
                    }

                    if (voucher.getMinOrderAmount() != null) {
                        if (request.getOrderAmount() == null) return bad("Order amount is required");
                        if (request.getOrderAmount().compareTo(voucher.getMinOrderAmount()) < 0) {
                            return bad("Order amount below voucher minimum: " + voucher.getMinOrderAmount().setScale(2, RoundingMode.HALF_UP));
                        }
                    }

                    return findUnusedPlatformUserVoucher(request.getUserId(), voucher.getId())
                            .flatMap(userVoucher -> {
                                if (userVoucher == null) return bad("User does not have this voucher or already used");

                                if (voucher.getScope() == PlatformScope.CATEGORY &&
                                        (voucher.getCategoryId() == null || !voucher.getCategoryId().equals(request.getCategoryId()))) {
                                    return bad("Voucher not applicable to this category");
                                }

                                BigDecimal discountAmount = calcDiscount(request.getOrderAmount(), voucher.getDiscountType(), voucher.getDiscountValue());
                                BigDecimal finalAmount = request.getOrderAmount().subtract(discountAmount);
                                if (finalAmount.compareTo(BigDecimal.ZERO) < 0) finalAmount = BigDecimal.ZERO;
                                finalAmount = finalAmount.setScale(2, RoundingMode.HALF_UP);

                                userVoucher.setStatus(VoucherStatus.USED);
                                userVoucher.setUsedAt(LocalDateTime.now());

                                voucher.setUsedCount(voucher.getUsedCount() == null ? 1 : voucher.getUsedCount() + 1);

                                return userVoucherRepository.save(userVoucher)
                                        .then(platformVoucherRepository.save(voucher))
                                        .then(ok(discountAmount, finalAmount, "Voucher applied successfully"));
                            });
                })
                .switchIfEmpty(bad("Voucher not found"));
    }

    private Mono<VoucherApplyResponse> applyShopWorkflow(VoucherApplyRequest request) {
        LocalDateTime now = LocalDateTime.now();

        return shopVoucherRepository.findById(request.getVoucherShopId())
                .flatMap(voucher -> {
                    if (voucher.getStartAt().isAfter(now) || voucher.getEndAt().isBefore(now)) {
                        return bad("Voucher is not active");
                    }

                    if (voucher.getMinOrderAmount() != null) {
                        if (request.getOrderAmount() == null) return bad("Order amount is required");
                        if (request.getOrderAmount().compareTo(voucher.getMinOrderAmount()) < 0) {
                            return bad("Order amount below voucher minimum: " + voucher.getMinOrderAmount().setScale(2, RoundingMode.HALF_UP));
                        }
                    }

                    return findUnusedShopUserVoucher(request.getUserId(), voucher.getId())
                            .flatMap(userVoucher -> {
                                if (userVoucher == null) return bad("User does not have this voucher or already used");

                                BigDecimal discountAmount = calcDiscount(request.getOrderAmount(), voucher.getDiscountType(), voucher.getDiscountValue());
                                BigDecimal finalAmount = request.getOrderAmount().subtract(discountAmount);
                                if (finalAmount.compareTo(BigDecimal.ZERO) < 0) finalAmount = BigDecimal.ZERO;
                                finalAmount = finalAmount.setScale(2, RoundingMode.HALF_UP);

                                userVoucher.setStatus(VoucherStatus.USED);
                                userVoucher.setUsedAt(LocalDateTime.now());

                                voucher.setUsedCount(voucher.getUsedCount() == null ? 1 : voucher.getUsedCount() + 1);

                                return userVoucherRepository.save(userVoucher)
                                        .then(shopVoucherRepository.save(voucher))
                                        .then(ok(discountAmount, finalAmount, "Voucher applied successfully"));
                            });
                })
                .switchIfEmpty(bad("Voucher not found"));
    }

    // -------------------------
    // Preview Workflows (no DB changes)
    // -------------------------
    private Mono<VoucherApplyResponse> previewCombinedWorkflow(VoucherApplyRequest request) {
        LocalDateTime now = LocalDateTime.now();

        if (request.getOrderAmount() == null) {
            return bad("Order amount is required for combined voucher preview");
        }

        BigDecimal originalAmount = request.getOrderAmount().setScale(2, RoundingMode.HALF_UP);

        return shopVoucherRepository.findById(request.getVoucherShopId())
                .flatMap(shopVoucher -> {
                    if (shopVoucher.getStartAt().isAfter(now) || shopVoucher.getEndAt().isBefore(now)) {
                        return bad("Shop voucher is not active");
                    }
                    if (shopVoucher.getMinOrderAmount() != null
                            && originalAmount.compareTo(shopVoucher.getMinOrderAmount()) < 0) {
                        return bad("Order amount below shop voucher minimum: " + shopVoucher.getMinOrderAmount().setScale(2, RoundingMode.HALF_UP));
                    }

                    Mono<UserVoucher> shopUserVoucherMono =
                            findUnusedShopUserVoucher(request.getUserId(), shopVoucher.getId());

                    return platformVoucherRepository.findById(request.getVoucherPlatformId())
                            .flatMap(platformVoucher -> {
                                if (platformVoucher.getStartAt().isAfter(now) || platformVoucher.getEndAt().isBefore(now)) {
                                    return bad("Platform voucher is not active");
                                }

                                if (platformVoucher.getScope() == PlatformScope.CATEGORY &&
                                        (platformVoucher.getCategoryId() == null || !platformVoucher.getCategoryId().equals(request.getCategoryId()))) {
                                    return bad("Platform voucher not applicable to this category");
                                }

                                Mono<UserVoucher> platformUserVoucherMono =
                                        findUnusedPlatformUserVoucher(request.getUserId(), platformVoucher.getId());

                                return Mono.zip(shopUserVoucherMono, platformUserVoucherMono)
                                        .flatMap(tuple -> {
                                            UserVoucher shopUserVoucher = tuple.getT1();
                                            UserVoucher platformUserVoucher = tuple.getT2();

                                            if (shopUserVoucher == null) return bad("User does not have the shop voucher or it's already used");
                                            if (platformUserVoucher == null) return bad("User does not have the platform voucher or it's already used");

                                            BigDecimal shopDiscount = calcDiscount(originalAmount, shopVoucher.getDiscountType(), shopVoucher.getDiscountValue());
                                            BigDecimal afterShop = originalAmount.subtract(shopDiscount);
                                            if (afterShop.compareTo(BigDecimal.ZERO) < 0) afterShop = BigDecimal.ZERO;
                                            afterShop = afterShop.setScale(2, RoundingMode.HALF_UP);

                                            if (platformVoucher.getMinOrderAmount() != null
                                                    && afterShop.compareTo(platformVoucher.getMinOrderAmount()) < 0) {
                                                return bad("Amount after shop voucher below platform voucher minimum: " + platformVoucher.getMinOrderAmount().setScale(2, RoundingMode.HALF_UP));
                                            }

                                            BigDecimal platformDiscount = calcDiscount(afterShop, platformVoucher.getDiscountType(), platformVoucher.getDiscountValue());
                                            BigDecimal finalAmount = afterShop.subtract(platformDiscount);
                                            if (finalAmount.compareTo(BigDecimal.ZERO) < 0) finalAmount = BigDecimal.ZERO;
                                            finalAmount = finalAmount.setScale(2, RoundingMode.HALF_UP);

                                            return ok(shopDiscount.add(platformDiscount), finalAmount, "Both vouchers can be applied (preview)");
                                        });
                            })
                            .switchIfEmpty(bad("Platform voucher not found"));
                })
                .switchIfEmpty(bad("Shop voucher not found"));
    }

    private Mono<VoucherApplyResponse> previewPlatformWorkflow(VoucherApplyRequest request) {
        LocalDateTime now = LocalDateTime.now();

        return platformVoucherRepository.findById(request.getVoucherPlatformId())
                .flatMap(voucher -> {
                    if (voucher.getStartAt().isAfter(now) || voucher.getEndAt().isBefore(now)) {
                        return bad("Voucher not active");
                    }

                    if (voucher.getMinOrderAmount() != null) {
                        if (request.getOrderAmount() == null) return bad("Order amount is required");
                        if (request.getOrderAmount().compareTo(voucher.getMinOrderAmount()) < 0) {
                            return bad("Order amount below voucher minimum: " + voucher.getMinOrderAmount().setScale(2, RoundingMode.HALF_UP));
                        }
                    }

                    return findUnusedPlatformUserVoucher(request.getUserId(), voucher.getId())
                            .flatMap(userVoucher -> {
                                if (userVoucher == null) return bad("User does not have this voucher or already used");

                                if (voucher.getScope() == PlatformScope.CATEGORY &&
                                        (voucher.getCategoryId() == null || !voucher.getCategoryId().equals(request.getCategoryId()))) {
                                    return bad("Voucher not applicable to this category");
                                }

                                BigDecimal discountAmount = calcDiscount(request.getOrderAmount(), voucher.getDiscountType(), voucher.getDiscountValue());
                                BigDecimal finalAmount = request.getOrderAmount().subtract(discountAmount);
                                if (finalAmount.compareTo(BigDecimal.ZERO) < 0) finalAmount = BigDecimal.ZERO;
                                finalAmount = finalAmount.setScale(2, RoundingMode.HALF_UP);

                                return ok(discountAmount, finalAmount, "Voucher can be applied");
                            });
                })
                .switchIfEmpty(bad("Voucher not found"));
    }

    private Mono<VoucherApplyResponse> previewShopWorkflow(VoucherApplyRequest request) {
        LocalDateTime now = LocalDateTime.now();

        return shopVoucherRepository.findById(request.getVoucherShopId())
                .flatMap(voucher -> {
                    if (voucher.getStartAt().isAfter(now) || voucher.getEndAt().isBefore(now)) {
                        return bad("Voucher is not active");
                    }

                    if (voucher.getMinOrderAmount() != null) {
                        if (request.getOrderAmount() == null) return bad("Order amount is required");
                        if (request.getOrderAmount().compareTo(voucher.getMinOrderAmount()) < 0) {
                            return bad("Order amount below voucher minimum: " + voucher.getMinOrderAmount().setScale(2, RoundingMode.HALF_UP));
                        }
                    }

                    return findUnusedShopUserVoucher(request.getUserId(), voucher.getId())
                            .flatMap(userVoucher -> {
                                if (userVoucher == null) return bad("User does not have this voucher or already used");

                                BigDecimal discountAmount = calcDiscount(request.getOrderAmount(), voucher.getDiscountType(), voucher.getDiscountValue());
                                BigDecimal finalAmount = request.getOrderAmount().subtract(discountAmount);
                                if (finalAmount.compareTo(BigDecimal.ZERO) < 0) finalAmount = BigDecimal.ZERO;
                                finalAmount = finalAmount.setScale(2, RoundingMode.HALF_UP);

                                return ok(discountAmount, finalAmount, "Voucher can be applied");
                            });
                })
                .switchIfEmpty(bad("Voucher not found"));
    }
}
