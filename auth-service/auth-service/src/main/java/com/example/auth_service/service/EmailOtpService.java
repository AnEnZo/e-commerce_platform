package com.example.auth_service.service;


import com.example.auth_service.entity.User;
import reactor.core.publisher.Mono;

public interface EmailOtpService {

    Mono<Void> createAndSendOtp(String username);
    Mono<User> validateOtpAndGetUser(String username, String otp);
}
