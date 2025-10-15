package com.example.product_service.dto;

import lombok.Data;

import java.util.UUID;

@Data
public class ProductVariantInfo {
    private UUID variantId;
    private UUID shopId;
    private String productName;
    private String imageUrl;
    private String shopName;
    private String color;
    private String size;
}
