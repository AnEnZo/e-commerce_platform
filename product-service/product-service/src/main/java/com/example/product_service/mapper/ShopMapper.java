package com.example.product_service.mapper;

import com.example.product_service.entity.Shop;
import com.example.product_service.dto.ShopDTO;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ShopMapper {

    ShopDTO toDTO(Shop shop);

    Shop toEntity(ShopDTO dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntityFromDto(ShopDTO dto, @MappingTarget Shop shop);
}