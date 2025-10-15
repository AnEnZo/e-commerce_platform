package com.example.Order_Service.dto;

import java.math.BigDecimal;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VoucherApplyResponseDTO {
    private boolean success;
    private String message;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;
    private String failureReason;
}

