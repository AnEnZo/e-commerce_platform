package com.example.product_service.mapper;

import com.example.product_service.entity.Review;
import com.example.product_service.dto.ReviewDTO;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ReviewMapper {
    // MapStruct tự map review.productId -> dto.productId
    ReviewDTO toDto(Review review);

    // MapStruct tự map dto.productId -> review.productId
    Review toEntity(ReviewDTO dto);
}
