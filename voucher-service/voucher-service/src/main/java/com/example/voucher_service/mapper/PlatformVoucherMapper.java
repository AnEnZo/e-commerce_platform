package com.example.voucher_service.mapper;

import com.example.voucher_service.dto.PlatformVoucherDTO;
import com.example.voucher_service.entity.PlatformVoucher;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PlatformVoucherMapper {

    PlatformVoucherDTO toDTO(PlatformVoucher entity);

    PlatformVoucher toEntity(PlatformVoucherDTO dto);

    void updateEntityFromDTO(PlatformVoucherDTO dto, @MappingTarget PlatformVoucher entity);
}