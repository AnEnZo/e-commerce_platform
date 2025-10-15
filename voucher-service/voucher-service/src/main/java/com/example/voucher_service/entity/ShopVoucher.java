// src/main/java/com/example/voucher_service/entity/ShopVoucher.java
package com.example.voucher_service.entity;

import com.example.voucher_service.ennum.DiscountType;
import com.example.voucher_service.ennum.Eligibility;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.relational.core.mapping.Column;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Table("shop_voucher")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShopVoucher {

    @Id
    private UUID id;

    /** Shop phát hành voucher này */
    @Column("shop_id")
    private UUID shopId;

    /** Mã voucher (VD: “SHOPXYZ50”) */
    @Column("code")
    private String code;

    /** Giảm bao nhiêu (phần trăm hoặc giá trị cố định) */
    @Column("discount_value")
    private BigDecimal discountValue;

    @Column("discount_type")
    private DiscountType discountType;  //FIXED_AMOUNT, PERCENTAGE, FREE_SHIPPING

    /** Số tiền tối thiểu để áp dụng voucher) */
    @Column("min_order_amount")
    private BigDecimal minOrderAmount;

    @Column("start_at")
    private LocalDateTime startAt;

    @Column("end_at")
    private LocalDateTime endAt;

    /** Giới hạn tổng lượt dùng voucher này */
    @Column("usage_limit")
    private Integer usageLimit;

    @Column("used_count")
    private Integer usedCount = 0;

    /** Chỉ cho khách follow shop / hoặc khách mới? */
    @Column("eligibility")
    private Eligibility eligibility;   // ALL,FOLLOWER_ONLY,NEW_USER_ONLY
}
