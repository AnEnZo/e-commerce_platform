package com.example.Order_Service.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VoucherApplyRequestDTO {
    private UUID voucherShopId;
    private UUID voucherPlatformId;
    private UUID userId;
    private BigDecimal orderAmount;
    private UUID categoryId;
}
