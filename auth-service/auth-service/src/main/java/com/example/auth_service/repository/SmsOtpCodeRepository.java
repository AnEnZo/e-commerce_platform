package com.example.auth_service.repository;


import com.example.auth_service.entity.OtpCode;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import reactor.core.publisher.Mono;

public interface SmsOtpCodeRepository extends R2dbcRepository<OtpCode, Long> {

    // Lấy OTP mới nhất theo số điện thoại
    Mono<OtpCode> findFirstByPhoneNumberOrderByCreatedAtDesc(String phoneNumber);

    // Xóa OTP theo số điện thoại
    Mono<Void> deleteByPhoneNumber(String phoneNumber);
}