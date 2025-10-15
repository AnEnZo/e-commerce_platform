package com.example.Order_Service.controller;

import com.example.Order_Service.dto.OrderDTO;
import com.example.Order_Service.ennum.PaymentStatus;
import com.example.Order_Service.service.OrderService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@AllArgsConstructor
public class OrderController {

    private final OrderService orderService;


    @PostMapping
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<OrderDTO>> createOrder(@RequestBody OrderDTO dto) {
        return orderService.createOrder(dto)
                .map(created -> ResponseEntity.status(HttpStatus.CREATED).body(created));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<OrderDTO>> getOrder(@PathVariable UUID id) {
        return orderService.getOrderById(id)
                .map(ResponseEntity::ok)
                .onErrorResume(ex -> Mono.just(ResponseEntity.notFound().build()));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Flux<OrderDTO> getAll() {
        return orderService.getAllOrders();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<OrderDTO>> updateOrder(@PathVariable UUID id, @RequestBody OrderDTO dto) {
        return orderService.updateOrder(id, dto)
                .map(ResponseEntity::ok)
                .onErrorResume(ex -> {
                    // simple error handling - return 404 if not found
                    return Mono.just(ResponseEntity.notFound().build());
                });
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<Void>> deleteOrder(@PathVariable UUID id) {
        return orderService.deleteOrder(id)
                .then(Mono.just(ResponseEntity.noContent().<Void>build()))
                .onErrorResume(ex -> Mono.just(ResponseEntity.notFound().build()));
    }

    // Payment-Service internal callback to update payment status for an order
    @PostMapping("/{id}/payment-status")
    @PreAuthorize("hasAnyRole('STAFF','ADMIN','USER')")
    public Mono<ResponseEntity<Void>> updatePaymentStatus(@PathVariable UUID id,
                                                          @RequestParam PaymentStatus status,
                                                          @RequestParam(required = false, name = "providerRef") String providerRef) {
        return orderService.updatePaymentStatus(id, status, providerRef)
                .thenReturn(ResponseEntity.ok().build());
    }
}
