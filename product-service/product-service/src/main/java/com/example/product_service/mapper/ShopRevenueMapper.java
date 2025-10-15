package com.example.product_service.mapper;

import com.example.product_service.dto.ShopRevenueDTO;
import com.example.product_service.dto.ShopRevenueCreateRequest;
import com.example.product_service.entity.ShopRevenue;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;


@Mapper(componentModel = "spring")
public interface ShopRevenueMapper {
    ShopRevenueDTO toDto(ShopRevenue entity);
    ShopRevenue toEntity(ShopRevenueDTO dto);


    // create request -> entity (id and audit fields handled in service)
    ShopRevenue toEntity(ShopRevenueCreateRequest req);
}