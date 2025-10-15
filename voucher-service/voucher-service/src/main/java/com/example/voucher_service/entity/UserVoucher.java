// src/main/java/com/example/voucher_service/entity/UserVoucher.java
package com.example.voucher_service.entity;

import com.example.voucher_service.ennum.VoucherStatus;
import lombok.*;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.relational.core.mapping.Column;

import java.time.LocalDateTime;
import java.util.UUID;

@Table("user_voucher")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserVoucher {

    @Id
    private UUID id;

    /** Liên kết đến các voucher chung hoặc shop */
    @Column("platform_voucher_id")
    private UUID platformVoucherId;   // nullable nếu là shop voucher

    @Column("shop_voucher_id")
    private UUID shopVoucherId;       // nullable nếu là platform voucher

    /** Tài khoản user được cấp voucher */
    @Column("user_id")
    private UUID userId;

    /** Trạng thái: UNUSED, USED, EXPIRED */
    @Column("status")
    private VoucherStatus status = VoucherStatus.UNUSED;     // UNUSED,USED,EXPIRED

    /** Ngày voucher được cấp cho user */
    @Column("issued_at")
    private LocalDateTime issuedAt;

    /** Ngày voucher hết hạn (thường copy từ voucher gốc) */
    @Column("expire_at")
    private LocalDateTime expireAt;

    /** Nếu user đã dùng, lưu lại thời điểm dùng */
    @Column("used_at")
    private LocalDateTime usedAt;
}
