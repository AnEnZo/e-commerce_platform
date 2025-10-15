package com.example.product_service.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Version;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.relational.core.mapping.Column;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table("shop_revenue")
public class ShopRevenue {
    @Id
    private UUID id;

    @Column("shop_id")
    private UUID shopId;

    // Khoảng thời gian áp dụng cho bản ghi doanh thu
    @Column("period_start")
    private LocalDate periodStart;

    @Column("period_end")
    private LocalDate periodEnd;

    // Aggregation: DAILY / MONTHLY / YEARLY
    @Column("aggregation")
    private String aggregation;

    // Số liệu tài chính
    @Column("total_gross")
    private BigDecimal totalGross;   // tổng trước khi trừ fees/refunds

    @Column("total_net")
    private BigDecimal totalNet;     // sau khi trừ phí, hoàn tiền

    @Column("orders_count")
    private Long ordersCount;

    @Column("refunds")
    private BigDecimal refunds;

    @Column("fees")
    private BigDecimal fees;

    @Column("currency")
    private String currency; // e.g. "VND", "USD"

    @Column("notes")
    private String notes;

    @Version
    private Long version;

    @CreatedDate
    @Column("created_at")
    private Instant createdAt;

    @LastModifiedDate
    @Column("updated_at")
    private Instant updatedAt;
}
