package com.example.Order_Service.dto;

import com.example.Order_Service.ennum.OrderStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderDTO {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private UUID id;

    @NotNull(message = "User ID must not be null")
    private UUID userId;

    @NotNull(message = "Shop ID must not be null")
    private UUID shopId;

    /** Tên người nhận hàng */
    @NotEmpty(message = "Receiver name must not be empty")
    private String receiverName;

    /** Số điện thoại người nhận */
    @NotEmpty(message = "Receiver phone must not be empty")
    private String receiverPhone;

    /** Địa chỉ giao hàng */
    @NotEmpty(message = " addressId must not be empty")
    private UUID addressId;

    /** Ghi chú của đơn hàng (nếu có) */
    private String note;

    private OrderStatus status;

    private UUID voucherShopId;

    private UUID voucherPlatformId;

    private UUID categoryId;

    /** Tổng tiền giảm giá (>= 0) */
    @DecimalMin(value = "0.00", inclusive = true, message = "Discount must be >= 0")
    private BigDecimal discountAmount;

    /** Tổng tiền đơn hàng (>= 0) */
    @NotNull(message = "Total amount must not be null")
    @DecimalMin(value = "0.00", inclusive = true, message = "Total must be >= 0")
    private BigDecimal totalAmount;

    /** Danh sách sản phẩm trong đơn — validate từng phần tử */
    @Valid
    @Size(min = 1, message = "Order must contain at least one item")
    private List<OrderItemDTO> items;

    private Instant createdAt;
    private Instant updatedAt;
}
