package com.example.Order_Service.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.relational.core.mapping.Column;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table("customer_addresses")
public class CustomerAddress {

    @Id
    private UUID id;

    @Column("user_id")
    private UUID userId; // liên kết tới bảng user bằng userId

    @Column("receiver_name")
    private String receiverName;

    @Column("phone_number")
    private String phoneNumber;

    @Column("detail_address")
    private String detailAddress; // số nhà, đường, phường/xã

    @Column("ward")
    private String ward;    // Xã/Phường

    @Column("district")
    private String district;   // Quận/Huyện

    @Column("province")
    private String province;    // Tỉnh/Thành phố

    @Column("is_default")
    private Boolean isDefault;
}