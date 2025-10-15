package com.example.Order_Service.controller;

import com.example.Order_Service.dto.CustomerAddressDTO;
import com.example.Order_Service.service.CustomerAddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;


import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
@Validated
public class CustomerAddressController {

    private final CustomerAddressService service;

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Flux<CustomerAddressDTO> getByUser(@PathVariable UUID userId) {
        return service.getAllByUserId(userId);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<CustomerAddressDTO>> getById(@PathVariable UUID id) {
        return service.getById(id)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<CustomerAddressDTO>> create(@Valid @RequestBody CustomerAddressDTO dto) {
        return service.create(dto)
                .map(saved -> ResponseEntity
                        .created(URI.create("/api/addresses/" + saved.getId()))
                        .body(saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<CustomerAddressDTO>> update(@PathVariable UUID id,
                                                           @Valid @RequestBody CustomerAddressDTO dto) {
        return service.update(id, dto)
                .map(ResponseEntity::ok)
                .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().build()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<Void>> delete(@PathVariable UUID id) {
        return service.getById(id)
                .flatMap(addr -> service.delete(id).thenReturn(ResponseEntity.noContent().<Void>build()))
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PatchMapping("/user/{userId}/{id}/default")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<CustomerAddressDTO>> setDefault(@PathVariable UUID userId, @PathVariable UUID id) {
        return service.setDefault(userId, id)
                .map(ResponseEntity::ok)
                .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().build()));
    }
}