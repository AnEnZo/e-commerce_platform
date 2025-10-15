package com.example.voucher_service.dto;

import com.example.voucher_service.ennum.DiscountType;
import com.example.voucher_service.ennum.PlatformScope;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class PlatformVoucherDTO {
    private UUID id;
    private String code;
    private BigDecimal discountValue;
    private DiscountType discountType;
    private BigDecimal minOrderAmount;
    private LocalDateTime startAt;
    private LocalDateTime endAt;
    private Integer usageLimit;
    private Integer usedCount;
    private PlatformScope scope;
    private UUID categoryId;
}