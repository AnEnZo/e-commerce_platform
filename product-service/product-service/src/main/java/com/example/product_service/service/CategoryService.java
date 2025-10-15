package com.example.product_service.service;




import com.example.product_service.dto.CategoryDTO;
import com.example.product_service.entity.Category;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CategoryService {
    Flux<CategoryDTO> getAllCategories();
    Mono<CategoryDTO> getCategoryById(UUID id);
    Mono<CategoryDTO> createCategory(CategoryDTO categoryDTO);
    Mono<CategoryDTO> updateCategory(UUID id, CategoryDTO categoryDTO);
    Mono<Void> deleteCategory(UUID id);

}

