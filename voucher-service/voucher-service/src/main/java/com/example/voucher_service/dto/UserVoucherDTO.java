package com.example.voucher_service.dto;

import com.example.voucher_service.ennum.VoucherStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class UserVoucherDTO {
    @Schema(description = "USERVOUCHER ID", accessMode = Schema.AccessMode.READ_ONLY)
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private UUID id;

    private UUID platformVoucherId;
    private UUID shopVoucherId;
    private UUID userId;
    private VoucherStatus status;
    private LocalDateTime issuedAt;
    private LocalDateTime expireAt;
    private LocalDateTime usedAt;

    // Additional fields for response
    private String voucherCode;
    private String discountValue;
    private String discountType;
}
