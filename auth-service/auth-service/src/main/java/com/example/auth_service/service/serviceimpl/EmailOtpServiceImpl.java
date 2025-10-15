package com.example.auth_service.service.serviceimpl;

import com.example.auth_service.entity.EmailOtp;
import com.example.auth_service.entity.User;
import com.example.auth_service.repository.EmailOtpRepository;
import com.example.auth_service.service.EmailOtpService;
import com.example.auth_service.service.UserService;

import lombok.AllArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@AllArgsConstructor
public class EmailOtpServiceImpl implements EmailOtpService {
    private static final long EXPIRATION_MINUTES = 10;

    private final EmailOtpRepository otpRepo;
    private final UserService userService;
    private final JavaMailSender mailSender;

    @Override
    public Mono<Void> createAndSendOtp(String username) {
        return userService.findByUsername(username)
                .switchIfEmpty(Mono.error(new UsernameNotFoundException("User not found")))
                .flatMap(user ->
                        // Xóa OTP cũ
                        otpRepo.deleteByUserId(user.getId())
                                .then(Mono.defer(() -> {
                                    // Tạo OTP ngẫu nhiên 6 chữ số
                                    String otp = String.format("%06d", new Random().nextInt(1_000_000));
                                    EmailOtp emailOtp = new EmailOtp();
                                    emailOtp.setUserId(user.getId());
                                    emailOtp.setOtp(otp);
                                    emailOtp.setExpiryDate(LocalDateTime.now().plusMinutes(EXPIRATION_MINUTES));

                                    // Lưu OTP
                                    return otpRepo.save(emailOtp)
                                            .doOnNext(savedOtp -> {
                                                // Gửi mail trong scheduler boundedElastic để không block reactive
                                                Mono.fromRunnable(() -> {
                                                    SimpleMailMessage msg = new SimpleMailMessage();
                                                    msg.setTo(user.getEmail());
                                                    msg.setSubject("OTP đặt lại mật khẩu");
                                                    msg.setText("Mã OTP của bạn là: " + otp + " (hết hạn trong 10 phút)");
                                                    mailSender.send(msg);
                                                }).subscribeOn(Schedulers.boundedElastic()).subscribe();
                                            }).then();
                                }))
                );
    }

    @Override
    public Mono<User> validateOtpAndGetUser(String username, String otp) {
        return userService.findByUsername(username)
                .switchIfEmpty(Mono.error(new UsernameNotFoundException("User not found")))
                .flatMap(user ->
                        otpRepo.findByUserId(user.getId())
                                .switchIfEmpty(Mono.error(new IllegalArgumentException("OTP không hợp lệ")))
                                .flatMap(emailOtp -> {
                                    if (emailOtp.getExpiryDate().isBefore(LocalDateTime.now())) {
                                        return Mono.error(new IllegalArgumentException("OTP đã hết hạn"));
                                    }
                                    if (!emailOtp.getOtp().equals(otp)) {
                                        return Mono.error(new IllegalArgumentException("OTP không đúng"));
                                    }
                                    // xóa OTP sau khi dùng
                                    return otpRepo.delete(emailOtp)
                                            .thenReturn(user);
                                })
                );
    }
}
