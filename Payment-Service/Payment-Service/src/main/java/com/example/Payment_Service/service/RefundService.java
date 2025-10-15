package com.example.Payment_Service.service;

import com.example.Payment_Service.dto.RefundDto;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface RefundService {
    Mono<RefundDto> createRefund(RefundDto refundDto);
    Mono<RefundDto> getRefundById(UUID id);
    Flux<RefundDto> getAllRefunds();
    Mono<Void> deleteRefund(UUID id);
}
