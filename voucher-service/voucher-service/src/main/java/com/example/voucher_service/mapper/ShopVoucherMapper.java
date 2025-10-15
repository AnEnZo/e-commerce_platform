package com.example.voucher_service.mapper;

import com.example.voucher_service.dto.ShopVoucherDTO;
import com.example.voucher_service.entity.ShopVoucher;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ShopVoucherMapper {

    ShopVoucherDTO toDTO(ShopVoucher entity);

    ShopVoucher toEntity(ShopVoucherDTO dto);

    void updateEntityFromDTO(ShopVoucherDTO dto, @MappingTarget ShopVoucher entity);
}
