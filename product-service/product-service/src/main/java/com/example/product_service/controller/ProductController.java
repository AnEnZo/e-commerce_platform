package com.example.product_service.controller;


import com.example.product_service.dto.*;
import com.example.product_service.document.ProductSearchResponse;
import com.example.product_service.mapper.ProductMapper;
import com.example.product_service.service.ProductService;

import com.example.product_service.service.impl.ProductSearchService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.net.URI;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/menu-items")
@AllArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final ProductSearchService productSearchService;
    private final ProductMapper mapper;

    @PostMapping("/sync-products-es")
    public Mono<String> syncProducts() {
        return productService.syncAllProductsToES()
                .thenReturn("Synced all products to Elasticsearch");
    }


    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<PageResponse<ProductDTO>> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "18") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        return productService.getAllProduct(pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ProductDTO> getById(@PathVariable UUID id) {
        return productService.getProductById(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    public Mono<ProductDTO> create(@Valid @RequestBody ProductCreateRequest createRequest) {
        return productService.createProduct(createRequest);
    }


    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public Mono<ProductDTO> update(
            @PathVariable UUID id,
            @Valid @RequestBody ProductDTO productDTO) {
        return productService.updateProduct(id, productDTO);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public Mono<Void> delete(@PathVariable UUID id) {
        return productService.deleteProduct(id);
    }

    @GetMapping("/category/{name}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Flux<ProductDTO> getByCategoryName(
            @PathVariable("name") String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        return productService.getProductByCategory(name, pageable);
    }

    @PostMapping("/variants/batch")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Flux<ProductVariantInfo> getVariantsBatch(@RequestBody List<UUID> variantIds) {
        return productService.getProductVariantsInfo(variantIds);
    }

    @PostMapping("/variants/{variantId}/deduct")
    public Mono<String> deductVariantStock(
            @PathVariable UUID variantId,
            @RequestParam int qty) {
        return productService.deductVariantStock(variantId, qty)
                .thenReturn("Đã trừ " + qty + " đơn vị khỏi variant " + variantId);
    }

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ProductSearchResponse> searchProducts(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "salesCount") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ?
                Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        return productSearchService.searchByKeyword(keyword, pageable);
    }

    @PostMapping("/search/advanced")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ProductSearchResponse> advancedSearch(
            @RequestBody SearchCriteria criteria,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "salesCount") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ?
                Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        return productSearchService.advancedSearch(criteria, pageable);
    }

    @GetMapping("/search/category/{categoryName}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Flux<ProductDTO> searchByCategory(
            @PathVariable String categoryName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "salesCount") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        return productService.getProductByCategory(categoryName, pageable);
    }

    @GetMapping("/search/shop/{shopId}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ProductSearchResponse> searchByShop(
            @PathVariable String shopId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "18") int size,
            @RequestParam(defaultValue = "salesCount") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ?
                Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        return productSearchService.searchByShop(shopId, pageable);
    }

    @GetMapping("/search/price-range")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ProductSearchResponse> searchByPriceRange(
            @RequestParam BigDecimal minPrice,
            @RequestParam BigDecimal maxPrice,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "salesCount") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ?
                Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        return productSearchService.searchByPriceRange(minPrice, maxPrice, pageable);
    }

    @GetMapping("/search/rating")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ProductSearchResponse> searchByMinRating(
            @RequestParam BigDecimal minRating,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "averageRating") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ?
                Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        return productSearchService.searchByMinRating(minRating, pageable);
    }

    @GetMapping("/search/in-stock")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ProductSearchResponse> searchInStockProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "salesCount") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ?
                Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        return productSearchService.searchInStockProducts(pageable);
    }

    @GetMapping("/search/suggestions")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Flux<String> getSearchSuggestions(
            @RequestParam String prefix,
            @RequestParam(defaultValue = "10") int limit) {

        return productSearchService.getSearchSuggestions(prefix, limit);
    }

    @GetMapping("/search/filters")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<SearchFilters> getSearchFilters() {
        return productSearchService.getSearchFilters();
    }


    @GetMapping("/best-sellers")
    public Mono<ProductSearchResponse> getBestSellers(Pageable pageable) {
        return productSearchService.getBestSellers(pageable);
    }

    @GetMapping("/discounts")
    public Mono<ProductSearchResponse> getDiscounts(Pageable pageable) {
        return productSearchService.getDiscountedProducts(pageable);
    }

}


