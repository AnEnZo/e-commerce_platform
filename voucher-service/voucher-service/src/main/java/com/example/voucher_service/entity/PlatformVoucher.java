// src/main/java/com/example/voucher_service/entity/PlatformVoucher.java
package com.example.voucher_service.entity;

import com.example.voucher_service.ennum.DiscountType;
import com.example.voucher_service.ennum.PlatformScope;
import lombok.*;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.relational.core.mapping.Column;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Table("platform_voucher")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlatformVoucher {

    @Id
    private UUID id;

    /** Mã voucher (VD: “PLAT10” ) */
    @Column("code")
    private String code;

    /** Phần trăm hoặc giá trị giảm (VD: 10% hoặc 50000đ) */
    @Column("discount_value")
    private BigDecimal discountValue;

    /** Loại giảm: PERCENTAGE / AMOUNT  */
    @Column("discount_type")
    private DiscountType discountType;   //FIXED_AMOUNT, PERCENTAGE, FREE_SHIPPING

    /** Số tiền tối thiểu để áp dụng voucher) */
    @Column("min_order_amount")
    private BigDecimal minOrderAmount;

    /** Ngày bắt đầu áp dụng */
    @Column("start_at")
    private LocalDateTime startAt;

    /** Ngày kết thúc áp dụng */
    @Column("end_at")
    private LocalDateTime endAt;

    /** Giới hạn số lần dùng chung (toàn sàn) */
    @Column("usage_limit")
    private Integer usageLimit;

    /** Số lần đã dùng đến giờ */
    @Column("used_count")
    private Integer usedCount = 0;

    /** Loại áp dụng: toàn sàn / ngành hàng */
    @Column("scope")
    private PlatformScope scope; //GLOBAL,CATEGORY

    /** Nếu scope = CATEGORY thì chỉ định categoryId */
    @Column("category_id")
    private UUID categoryId;
}
