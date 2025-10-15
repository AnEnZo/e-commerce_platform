package com.example.Payment_Service.service;

import com.example.Payment_Service.dto.CreatePaymentDto;
import reactor.core.publisher.Mono;

import java.util.Map;

public interface PaymentService {
    Mono<Void> processWebhook(String body);
    Mono<Map<String, Object>> createPaymentFromExternal(CreatePaymentDto dto);
}
