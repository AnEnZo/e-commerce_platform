package com.example.Order_Service.mapper;

import com.example.Order_Service.entity.CustomerAddress;
import com.example.Order_Service.dto.CustomerAddressDTO;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CustomerAddressMapper {

    CustomerAddressDTO toDto(CustomerAddress entity);

    CustomerAddress toEntity(CustomerAddressDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(CustomerAddressDTO dto, @MappingTarget CustomerAddress entity);
}