package com.example.product_service.repository;

import com.example.product_service.document.ProductDocument;
import org.springframework.data.elasticsearch.repository.ReactiveElasticsearchRepository;
import reactor.core.publisher.Flux;

public interface ProductDocumentRepository extends ReactiveElasticsearchRepository<ProductDocument, String> {
    Flux<ProductDocument> findByNameContainingIgnoreCase(String keyword);
    Flux<ProductDocument> findByNameContaining(String name);
    Flux<ProductDocument> findByCategoryName(String categoryName);
    Flux<ProductDocument> findByShopId(String shopId);
    Flux<ProductDocument> findByStatusOrderBySalesCountDesc(String status);
}
