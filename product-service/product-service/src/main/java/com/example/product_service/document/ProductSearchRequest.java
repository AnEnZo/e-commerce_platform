package com.example.product_service.document;

import lombok.Data;

@Data
public class ProductSearchRequest {
    private String keyword;
    private String categoryId;
    private String shopName;
    private int page = 0;
    private int size = 10;
}

