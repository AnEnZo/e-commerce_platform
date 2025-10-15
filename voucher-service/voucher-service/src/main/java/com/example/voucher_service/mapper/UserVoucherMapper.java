package com.example.voucher_service.mapper;

import com.example.voucher_service.dto.UserVoucherDTO;
import com.example.voucher_service.entity.UserVoucher;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserVoucherMapper {

    @Mapping(target = "voucherCode", ignore = true)
    @Mapping(target = "discountValue", ignore = true)
    @Mapping(target = "discountType", ignore = true)
    UserVoucherDTO toDTO(UserVoucher entity);

    UserVoucher toEntity(UserVoucherDTO dto);

    void updateEntityFromDTO(UserVoucherDTO dto, @MappingTarget UserVoucher entity);
}