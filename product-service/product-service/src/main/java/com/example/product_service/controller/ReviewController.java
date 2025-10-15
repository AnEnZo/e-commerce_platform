package com.example.product_service.controller;

import com.example.product_service.dto.ReviewDTO;
import com.example.product_service.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService service;

    @PostMapping
    public Mono<ResponseEntity<ReviewDTO>> create(@Valid @RequestBody Mono<ReviewDTO> dtoMono) {
        return dtoMono
                .flatMap(service::createReview)
                .map(created -> ResponseEntity
                        .created(URI.create("/api/reviews/" + created.getId()))
                        .body(created)
                );
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<ReviewDTO>> getById(@PathVariable UUID id) {
        return service.getReviewById(id)
                .map(ResponseEntity::ok)
                .onErrorResume(ex -> Mono.just(ResponseEntity.notFound().build()));
    }

    @GetMapping
    public Flux<ReviewDTO> getAll(@RequestParam(required = false) UUID productId) {
        return (productId != null)
                ? service.getReviewsByProductId(productId)
                : service.getAllReviews();
    }

    @PutMapping("/{id}")
    public Mono<ResponseEntity<ReviewDTO>> update(@PathVariable UUID id,
                                                  @Valid @RequestBody Mono<ReviewDTO> dtoMono) {
        return dtoMono
                .flatMap(dto -> service.updateReview(id, dto))
                .map(ResponseEntity::ok)
                .onErrorResume(ex -> Mono.just(ResponseEntity.notFound().build()));
    }

    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> delete(@PathVariable UUID id) {
        return service.deleteReview(id)
                .then(Mono.just(ResponseEntity.noContent().<Void>build()))
                .onErrorResume(ex -> Mono.just(ResponseEntity.notFound().build()));
    }
}
