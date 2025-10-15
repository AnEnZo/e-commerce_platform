package com.example.product_service.controller;

import com.example.product_service.dto.CategoryDTO;
import com.example.product_service.service.CategoryService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
@AllArgsConstructor
public class CategoryController {

    private final CategoryService service;

    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Flux<CategoryDTO> getAll() {
        return service.getAllCategories();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<CategoryDTO>> getById(@PathVariable UUID id) {
        return service.getCategoryById(id)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN')")
    public Mono<ResponseEntity<CategoryDTO>> create(@Valid @RequestBody Mono<CategoryDTO> categoryDTOMono) {
        return categoryDTOMono
                .flatMap(service::createCategory)
                .map(created -> ResponseEntity
                        .created(URI.create("/api/categories/" + created.getId()))
                        .body(created)
                );
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public Mono<ResponseEntity<CategoryDTO>> update(
            @PathVariable UUID id,
            @Valid @RequestBody Mono<CategoryDTO> categoryDTOMono) {

        return categoryDTOMono
                .flatMap(dto -> service.updateCategory(id, dto))
                .map(ResponseEntity::ok)
                .onErrorResume(ex -> {
                    // Nếu service ném lỗi khi không tìm thấy, trả 404.
                    // Bạn có thể đổi điều kiện kiểm tra exception cụ thể hơn.
                    return Mono.just(ResponseEntity.notFound().build());
                });
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public Mono<ResponseEntity<Void>> delete(@PathVariable UUID id) {
        return service.deleteCategory(id)
                .then(Mono.just(ResponseEntity.noContent().<Void>build()))
                .onErrorResume(ex -> Mono.just(ResponseEntity.notFound().build()));
    }
}
