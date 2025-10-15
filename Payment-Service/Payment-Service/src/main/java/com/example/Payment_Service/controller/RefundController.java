package com.example.Payment_Service.controller;

import com.example.Payment_Service.dto.RefundDto;
import com.example.Payment_Service.service.RefundService;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@RestController
@RequestMapping("/api/refunds")
public class RefundController {

    private final RefundService refundService;

    public RefundController(RefundService refundService) {
        this.refundService = refundService;
    }

    // Accept body as Mono<RefundDto> (reactive)
    @PostMapping
    public Mono<RefundDto> createRefund(@RequestBody Mono<RefundDto> refundDtoMono) {
        return refundDtoMono.flatMap(refundService::createRefund);
    }

    @GetMapping("/{id}")
    public Mono<RefundDto> getRefundById(@PathVariable UUID id) {
        return refundService.getRefundById(id);
    }

    @GetMapping
    public Flux<RefundDto> getAllRefunds() {
        return refundService.getAllRefunds();
    }

    @DeleteMapping("/{id}")
    public Mono<Void> deleteRefund(@PathVariable UUID id) {
        return refundService.deleteRefund(id);
    }
}
