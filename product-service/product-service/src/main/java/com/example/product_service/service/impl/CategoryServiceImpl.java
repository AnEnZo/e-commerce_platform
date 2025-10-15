// CategoryServiceImpl.java
package com.example.product_service.service.impl;

import com.example.product_service.dto.CategoryDTO;
import com.example.product_service.entity.Category;
import com.example.product_service.mapper.CategoryMapper;
import com.example.product_service.repository.CategoryRepository;
import com.example.product_service.service.CategoryService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Service
@AllArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository repository;
    private final CategoryMapper mapper;

    @Override
    public Flux<CategoryDTO> getAllCategories() {
        return repository.findAll()
                .map(mapper::toDto);
    }

    @Override
    public Mono<CategoryDTO> getCategoryById(UUID id) {
        return repository.findById(id)
                .map(mapper::toDto);
    }

    @Override
    public Mono<CategoryDTO> createCategory(CategoryDTO categoryDTO) {
        Category category = mapper.toEntity(categoryDTO);
        return repository.save(category)
                .map(mapper::toDto);
    }

    @Override
    public Mono<CategoryDTO> updateCategory(UUID id, CategoryDTO categoryDTO) {
        return repository.findById(id)
                .switchIfEmpty(Mono.error(new RuntimeException("Category not found with id " + id)))
                .flatMap(existing -> {
                    existing.setName(categoryDTO.getName());
                    return repository.save(existing);
                })
                .map(mapper::toDto);
    }

    @Override
    public Mono<Void> deleteCategory(UUID id) {
        return repository.findById(id)
                .switchIfEmpty(Mono.error(new RuntimeException("Category not found with id " + id)))
                .flatMap(repository::delete);
    }
}
