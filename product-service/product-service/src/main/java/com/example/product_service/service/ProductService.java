package com.example.product_service.service;



import com.example.product_service.dto.PageResponse;
import com.example.product_service.dto.ProductCreateRequest;
import com.example.product_service.dto.ProductDTO;
import com.example.product_service.dto.ProductVariantInfo;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ProductService {
    Mono<PageResponse<ProductDTO>> getAllProduct(Pageable pageable);
//    Flux<ProductDTO> getAllProduct(Pageable pageable);
    Mono<ProductDTO> getProductById(UUID id);
    Mono<ProductDTO> createProduct(ProductCreateRequest createRequest);
    Mono<ProductDTO> updateProduct(UUID id, ProductDTO productDTO);
    Mono<Void> deleteProduct(UUID id);
    Flux<ProductDTO> getProductByCategory(String categoryName, Pageable pageable);
    Flux<ProductVariantInfo> getProductVariantsInfo(List<UUID> variantIds);
    Mono<Void> recordSale(UUID productId, long qty);
    Mono<Void> syncAllProductsToES();
    Mono<Void> deductVariantStock(UUID variantId, int qty);

}
