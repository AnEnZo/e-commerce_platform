package com.example.Shopping_Cart_Service.mapper;

import com.example.Shopping_Cart_Service.dto.CartItemDTO;
import com.example.Shopping_Cart_Service.dto.ShoppingCartDTO;
import com.example.Shopping_Cart_Service.entity.CartItem;
import com.example.Shopping_Cart_Service.entity.ShoppingCart;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface ShoppingCartMapper {

    ShoppingCartMapper INSTANCE = Mappers.getMapper(ShoppingCartMapper.class);

    // ---------------- CartItem mapping ----------------
    @Mapping(target = "productName", ignore = true)
    @Mapping(target = "productImageUrl", ignore = true)
    @Mapping(target = "shopName", ignore = true)
    CartItemDTO toCartItemDTO(CartItem item);

    CartItem toCartItemEntity(CartItemDTO dto);

    List<CartItemDTO> toCartItemDTOList(List<CartItem> items);

    List<CartItem> toCartItemEntityList(List<CartItemDTO> dtos);

    // ---------------- ShoppingCart mapping ----------------
    // Map các field cơ bản của ShoppingCart
    ShoppingCartDTO toCartDTO(ShoppingCart cart);

    ShoppingCart toCartEntity(ShoppingCartDTO dto);

    // Map ShoppingCart + List<CartItemDTO> ra ShoppingCartDTO hoàn chỉnh
    default ShoppingCartDTO toCartDTO(ShoppingCart cart, List<CartItemDTO> items) {
        if (cart == null) return null;
        ShoppingCartDTO dto = toCartDTO(cart); // map các field cơ bản
        dto.setItems(items);
        return dto;
    }
}
