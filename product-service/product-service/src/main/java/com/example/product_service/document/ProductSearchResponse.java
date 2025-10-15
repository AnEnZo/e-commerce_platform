package com.example.product_service.document;

import com.example.product_service.dto.ProductDTO;
import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;

import java.util.List;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductSearchResponse {
    private List<ProductDTO> products;
    private long totalElements;
    private int totalPages;
    private int currentPage;
    private int pageSize;
    private String sortBy;
    private String sortDirection;
    private Map<String, Object> aggregations; // Để chứa thông tin thống kê
}