package com.example.product_service.dto;

import com.example.product_service.ennum.SellerType;
import com.example.product_service.ennum.VerificationStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopDTO {

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private UUID id;

    // cơ bản
    @NotEmpty(message = "Tên cửa hàng không được để trống")
    @Size(max = 100, message = "Tên cửa hàng không được vượt quá 100 ký tự")
    private String name;

    @NotNull(message = "ID chủ sở hữu không được để trống")
    private UUID ownerId;

    @Size(max = 500, message = "URL hình ảnh không được vượt quá 500 ký tự")
    private String imageUrl;

    private SellerType sellerType;

    // ---- Thông tin cá nhân ----
    private String fullName;
    private LocalDate dateOfBirth;
    private String phone;
    @Email(message = "Email không hợp lệ")
    private String email;
    private String warehouseAddress;
    private String idFrontImageUrl;
    private String idBackImageUrl;

    // ---- Thông tin doanh nghiệp ----
    private String businessName;
    private String taxId;
    private String businessLicenseUrl;
    private String legalRepresentative;
    private String companyAddress;

    // ---- Thông tin ngân hàng ----
    private String bankAccountHolder;
    private String bankAccountNumber;
    private String bankName;

    private VerificationStatus verificationStatus;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Instant createdAt;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Instant updatedAt;
}
