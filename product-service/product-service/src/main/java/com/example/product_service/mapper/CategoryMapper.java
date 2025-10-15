package com.example.product_service.mapper;

import com.example.product_service.dto.*;
import com.example.product_service.entity.*;
import org.mapstruct.Mapper;
import java.util.List;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    // MapStruct sẽ tự map id,name,parentId -> parentId nếu cùng tên
    CategoryDTO toDto(Category entity);

    // DTO.parentId -> Entity.parentId (tự map), nếu bạn muốn custom thì dùng @Mapping(target="parentId", source="parentId")
    Category toEntity(CategoryDTO dto);

    List<CategoryDTO> toDtoList(List<Category> entities);

    List<Category> toEntityList(List<CategoryDTO> dtos);
}
