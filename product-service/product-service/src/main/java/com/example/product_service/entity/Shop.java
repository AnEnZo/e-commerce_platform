package com.example.product_service.entity;

import com.example.product_service.ennum.SellerType;
import com.example.product_service.ennum.VerificationStatus;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Version;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.relational.core.mapping.Column;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table("shop")
public class Shop {
    @Id
    private UUID id;

    // cơ bản
    @Column("name")
    private String name;

    @Column("owner_id")
    private UUID ownerId;

    @Column("image_url")
    private String imageUrl;

    // seller type: INDIVIDUAL or BUSINESS
    @Column("seller_type")
    private SellerType sellerType;

    // ---- Thông tin cho người bán cá nhân ----
    @Column("full_name")
    private String fullName;              // Họ và tên (CMND/CCCD trùng tên)

    @Column("date_of_birth")
    private LocalDate dateOfBirth;        // Ngày sinh

    @Column("phone")
    private String phone;

    @Column("email")
    private String email;

    @Column("warehouse_address")
    private String warehouseAddress;      // Địa chỉ kho hàng

    @Column("id_front_image_url")
    private String idFrontImageUrl;       // Ảnh mặt trước CMND/CCCD

    @Column("id_back_image_url")
    private String idBackImageUrl;        // Ảnh mặt sau CMND/CCCD

    // ---- Thông tin cho người bán doanh nghiệp ----
    @Column("business_name")
    private String businessName;          // Tên doanh nghiệp

    @Column("tax_id")
    private String taxId;                 // Mã số thuế

    @Column("business_license_url")
    private String businessLicenseUrl;    // URL giấy phép đăng ký kinh doanh

    @Column("legal_representative")
    private String legalRepresentative;   // Người đại diện pháp luật

    @Column("company_address")
    private String companyAddress;        // Địa chỉ công ty

    // ---- Thông tin ngân hàng ----
    @Column("bank_account_holder")
    private String bankAccountHolder;     // Chủ tài khoản

    @Column("bank_account_number")
    private String bankAccountNumber;     // Số tài khoản (=> nên mã hoá)

    @Column("bank_name")
    private String bankName;

    // optional: trạng thái xác minh
    @Column("verification_status")
    private VerificationStatus verificationStatus;  //verified,unverified

    @Version
    private Long version;

    @CreatedDate
    @Column("created_at")
    private Instant createdAt;

    @LastModifiedDate
    @Column("updated_at")
    private Instant updatedAt;
}

