package com.example.voucher_service.dto;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class VoucherApplyRequest {
    private UUID voucherShopId;
    private UUID voucherPlatformId;
    private UUID userId;
    private BigDecimal orderAmount;
    private UUID categoryId;
}
