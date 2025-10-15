package com.example.auth_service.repository;



import com.example.auth_service.entity.EmailOtp;
import com.example.auth_service.entity.User;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface EmailOtpRepository extends R2dbcRepository<EmailOtp, Long> {

    // Lấy OTP theo user
    Mono<EmailOtp> findByUserId(UUID userId);

    // Xóa OTP theo user
    Mono<Void> deleteByUserId(UUID userId);
}