package com.example.product_service.controller;

import com.example.product_service.dto.PageResponse;
import com.example.product_service.dto.ShopDTO;
import com.example.product_service.service.ShopService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/shops")
@RequiredArgsConstructor
@Slf4j
public class ShopController {

    private final ShopService shopService;

    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<ShopDTO>> create(@Valid @RequestBody ShopDTO shopDTO) {
        return shopService.create(shopDTO)
                .map(created -> ResponseEntity
                        .created(URI.create("/api/shops/" + created.getId()))
                        .body(created)
                )
                .onErrorResume(ex -> {
                    log.error("create shop failed", ex);
                    return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build());
                });
    }



    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<ShopDTO>> getById(@PathVariable UUID id) {
        return shopService.getById(id)
                .map(ResponseEntity::ok)
                .onErrorResume(ex -> Mono.just(ResponseEntity.notFound().build()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<PageResponse<ShopDTO>>> getAll(
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "20") int size) {

        if (page < 0 || size <= 0) {
            return Mono.just(ResponseEntity.badRequest().build());
        }

        return shopService.getAll(page, size)
                .map(ResponseEntity::ok)
                .onErrorResume(ex -> {
                    if (ex instanceof IllegalArgumentException) {
                        return Mono.just(ResponseEntity.badRequest().build());
                    }
                    return Mono.just(ResponseEntity.status(500).build());
                });
    }


    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<ShopDTO>> update(@PathVariable UUID id,
                                                @Valid @RequestBody Mono<ShopDTO> dtoMono) {
        return dtoMono
                .flatMap(dto -> shopService.update(id, dto))
                .map(ResponseEntity::ok)
                .onErrorResume(ex -> Mono.just(ResponseEntity.notFound().build()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<Void>> delete(@PathVariable UUID id) {
        return shopService.delete(id)
                .then(Mono.just(ResponseEntity.noContent().<Void>build()))
                .onErrorResume(ex -> Mono.just(ResponseEntity.notFound().build()));
    }

    @GetMapping("/owner/{ownerId}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ShopDTO> getByOwnerId(@PathVariable UUID ownerId) {
        return shopService.getByOwnerId(ownerId);
    }
}
