package com.example.auth_service.service.serviceimpl;

import com.example.auth_service.entity.OtpCode;
import com.example.auth_service.repository.SmsOtpCodeRepository;
import com.example.auth_service.service.SmsService;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class SmsServiceImpl implements SmsService {

    private final SmsOtpCodeRepository otpRepo;

    @Value("${twilio.account-sid}")
    private String accountSid;

    @Value("${twilio.auth-token}")
    private String authToken;

    @Value("${twilio.from-phone}")
    private String fromPhone;

    private static final long EXPIRATION_MINUTES = 5;

    @PostConstruct
    public void init() {
        Twilio.init(accountSid, authToken);
        log.info("Twilio initialized with SID {}", accountSid);
    }

    @Override
    public Mono<Void> sendOtp(String phoneNumber) {
        String code = String.format("%06d", new Random().nextInt(1_000_000));

        return otpRepo.deleteByPhoneNumber(phoneNumber) // Xóa OTP cũ
                .then(Mono.defer(() -> {
                    OtpCode otp = OtpCode.builder()
                            .phoneNumber(phoneNumber)
                            .code(code)
                            .createdAt(LocalDateTime.now())
                            .build();

                    return otpRepo.save(otp)
                            .doOnNext(savedOtp -> {
                                // Gửi SMS trên boundedElastic để không block reactive
                                Mono.fromRunnable(() -> {
                                    String body = String.format("Ma OTP cua ban la: %s (HSD 5 phut)", code);
                                    try {
                                        Message message = Message.creator(
                                                new PhoneNumber(phoneNumber),
                                                new PhoneNumber(fromPhone),
                                                body
                                        ).create();
                                        log.info("Twilio SMS sent successfully: SID={} to={} text={}",
                                                message.getSid(), phoneNumber, body);
                                    } catch (Exception e) {
                                        log.error("Lỗi gửi SMS qua Twilio", e);
                                    }
                                }).subscribeOn(Schedulers.boundedElastic()).subscribe();
                            })
                            .then();
                }));
    }

    @Override
    public Mono<Boolean> verifyOtp(String phoneNumber, String code) {
        return otpRepo.findFirstByPhoneNumberOrderByCreatedAtDesc(phoneNumber)
                .filter(otp -> !otp.isExpired())
                .map(otp -> otp.getCode().equals(code))
                .defaultIfEmpty(false);
    }
}
