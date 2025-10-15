package com.example.auth_service.service;

import reactor.core.publisher.Mono;

public interface SmsService {
    Mono<Void> sendOtp(String phoneNumber);
    Mono<Boolean> verifyOtp(String phoneNumber, String code);
}
