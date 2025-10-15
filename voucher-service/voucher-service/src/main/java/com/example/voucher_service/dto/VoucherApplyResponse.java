package com.example.voucher_service.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class VoucherApplyResponse {
    private boolean success;
    private String message;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String failureReason;
}
