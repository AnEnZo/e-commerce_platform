package com.example.auth_service.controller;


import com.example.auth_service.dto.AuthRequest;
import com.example.auth_service.dto.AuthResponse;
import com.example.auth_service.dto.RegisterRequest;
import com.example.auth_service.dto.ResetPasswordRequest;
import com.example.auth_service.ennum.AuthProvider;
import com.example.auth_service.entity.User;
import com.example.auth_service.security.JwtTokenUtil;
import com.example.auth_service.service.EmailOtpService;
import com.example.auth_service.service.SmsService;
import com.example.auth_service.service.UserService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.http.*;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.mail.MailException;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
@AllArgsConstructor
public class AuthController {

    private final UserService userService;
    private final ReactiveAuthenticationManager reactiveAuthenticationManager;
    private final JwtTokenUtil jwtTokenUtil;
    private final SmsService smsService;
    private final EmailOtpService emailOtpService;
    private ReactiveStringRedisTemplate redisTemplate;

    @PostMapping("/login")
    public Mono<ResponseEntity<?>> login(@RequestBody AuthRequest authRequest, ServerHttpResponse response) {
        return userService.findByUsername(authRequest.getUsername())
                .switchIfEmpty(Mono.error(new UsernameNotFoundException("Invalid username or password")))
                .flatMap(user -> {
                    if (user.getProvider() != AuthProvider.LOCAL) {
                        return Mono.just(ResponseEntity.status(403).body("Invalid username or password"));
                    }

                    return reactiveAuthenticationManager.authenticate(
                                    new UsernamePasswordAuthenticationToken(
                                            authRequest.getUsername(),
                                            authRequest.getPassword()
                                    )
                            )
                            .map(auth -> {
                                // tạo JWT
                                String token = jwtTokenUtil.generateToken((UserDetails) auth.getPrincipal());

                                // tính thời gian sống cookie theo expiration của JWT (an toàn hơn)
                                Date expDate = jwtTokenUtil.getExpirationDateFromToken(token);
                                long secondsUntilExpiry = Math.max(0,
                                        Duration.between(Instant.now(), expDate.toInstant()).getSeconds());

                                // 1) cookie JWT (HttpOnly) - trình duyệt sẽ tự gửi cookie này, JS không đọc được
                                ResponseCookie jwtCookie = ResponseCookie.from("ACCESS-TOKEN", token)
                                        .path("/")
                                        .httpOnly(true)    // CHÍNH: không cho JS đọc
                                        .secure(true)      // Bật trên production (HTTPS)
                                        .sameSite("Lax")   // hoặc "Strict" tuỳ flow
                                        .maxAge(Duration.ofSeconds(secondsUntilExpiry))
                                        .build();

                                // 2) cookie CSRF (non-HttpOnly) để JS đọc và gửi header X-XSRF-TOKEN
                                String csrfToken = UUID.randomUUID().toString();
                                ResponseCookie csrfCookie = ResponseCookie.from("XSRF-TOKEN", csrfToken)
                                        .path("/")
                                        .httpOnly(false)   // JS cần đọc để gửi header
                                        .secure(true)      // bật trên production
                                        .sameSite("Lax")
                                        .maxAge(Duration.ofSeconds(secondsUntilExpiry)) // cùng TTL hoặc ngắn hơn
                                        .build();

                                response.addCookie(jwtCookie);
                                response.addCookie(csrfCookie);

                                // KHÔNG bắt buộc trả token trong body khi đã đặt HttpOnly cookie.
                                // Trả body đơn giản để client biết login thành công.
                                return ResponseEntity.ok(Map.of(
                                        "message", "Login successful"
                                        // nếu muốn debug: "token", token
                                ));
                            });
                });
    }


    @PostMapping("/register")
    public Mono<ResponseEntity<?>> register(@Valid @RequestBody RegisterRequest registerRequest) {
        return userService.existsByUsername(registerRequest.getUsername())
                .flatMap(exists -> {
                    if (exists) {
                        return Mono.just(ResponseEntity.badRequest().body("Username is already taken!"));
                    }
                    return userService.existsByEmail(registerRequest.getEmail())
                            .flatMap(emailExists -> {
                                if (emailExists) {
                                    return Mono.just(ResponseEntity.badRequest().body("Email is already in use!"));
                                }
                                return userService.registerNewUser(registerRequest)
                                        .then(Mono.just(ResponseEntity.status(HttpStatus.CREATED)
                                                .body("User registered successfully!")));
                            });
                });
    }


    @PostMapping("/forgot-password-email")
    public Mono<ResponseEntity<Map<String, String>>> forgotPasswordEmail(@RequestBody Map<String, String> body) {
        String username = body.get("username");
        if (username == null || username.isBlank()) {
            return Mono.just(Map.of("message", "username is required"))
                    .map(msg -> ResponseEntity.badRequest().body(msg));
        }

        return emailOtpService.createAndSendOtp(username)
                .then(Mono.just(Map.of("message", "OTP đã được gửi đến email")))
                .map(msg -> ResponseEntity.ok(msg))
                .onErrorResume(MailException.class, e ->
                        Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(Map.of("message", "Lỗi khi gửi email")))
                )
                .onErrorResume(UsernameNotFoundException.class, e ->
                        Mono.just(ResponseEntity.ok(Map.of("message", "OTP đã được gửi đến email")))
                );
    }


    @PostMapping("/reset-password-email")
    public Mono<ResponseEntity<Map<String, String>>> resetPasswordEmail(@RequestBody ResetPasswordRequest req) {
        return emailOtpService.validateOtpAndGetUser(req.getUsername(), req.getOtp())
                .flatMap(user -> userService.updatePassword(user, req.getNewPassword())
                        .then(Mono.just(Map.of("message", "Đặt lại mật khẩu thành công")))
                )
                .map(body -> ResponseEntity.ok(body))
                .onErrorResume(UsernameNotFoundException.class, e ->
                        Mono.just(ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(Map.of("message", e.getMessage())))
                )
                .onErrorResume(IllegalArgumentException.class, e ->
                        Mono.just(ResponseEntity.badRequest()
                                .body(Map.of("message", e.getMessage())))
                );
    }


    @PostMapping("/forgot-password-sms")
    public Mono<ResponseEntity<Map<String, String>>> forgotPasswordBySms(@RequestParam String username) {
        return userService.findByUsername(username)
                .flatMap(user -> smsService.sendOtp(user.getPhoneNumber())
                        .then(Mono.just(Map.of("message", "Đã gửi mã OTP đến số điện thoại.")))
                )
                .map(ResponseEntity::ok)
                .onErrorResume(e ->
                        Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(Map.of("message", "Lỗi khi gửi SMS")))
                );
    }

    @PostMapping("/reset-password-sms")
    public Mono<ResponseEntity<Map<String, String>>> resetPasswordBySms(@RequestParam String username,
                                                                        @RequestParam String otp,
                                                                        @RequestParam String newPassword) {
        return userService.findByUsername(username)
                .switchIfEmpty(Mono.error(new UsernameNotFoundException("Không tìm thấy user: " + username)))
                .flatMap(user -> smsService.verifyOtp(user.getPhoneNumber(), otp)
                        .flatMap(valid -> {
                            if (!valid) {
                                return Mono.just(
                                        ResponseEntity.badRequest()
                                                .body(Map.of("message", "Mã OTP không hợp lệ hoặc đã hết hạn."))
                                );
                            }
                            return userService.updatePassword(user, newPassword)
                                    .then(Mono.just(
                                            ResponseEntity.ok(Map.of("message", "Đặt lại mật khẩu thành công!"))
                                    ));
                        })
                )
                .onErrorResume(UsernameNotFoundException.class, e ->
                        Mono.just(ResponseEntity.status(HttpStatus.NOT_FOUND)
                                .body(Map.of("message", e.getMessage())))
                );
    }

    @PostMapping(value = "/validate-token", produces = MediaType.APPLICATION_JSON_VALUE)
    public Mono<ResponseEntity<Map<String, Object>>> validateToken(
            @CookieValue(value = "ACCESS-TOKEN", required = false) String cookieToken,
            @RequestHeader(value = "Authorization", required = false) String authHeader) {


        String token = null;
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else if (cookieToken != null && !cookieToken.isBlank()) {
            token = cookieToken;
        }

        // Nếu không có token trả lỗi (kiểm tra token chứ không phải cookieToken)
        if (token == null || token.isBlank()) {
            Map<String, Object> body = new HashMap<>();
            body.put("valid", false);
            body.put("message", "Missing token");
            return Mono.just(ResponseEntity
                    .badRequest()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body));
        }

        try {
            if (jwtTokenUtil.isTokenExpired(token)) {
                Map<String, Object> body = new HashMap<>();
                body.put("valid", false);
                body.put("message", "Token đã hết hạn");
                return Mono.just(ResponseEntity
                        .status(HttpStatus.UNAUTHORIZED)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(body));
            }
            UUID userID = jwtTokenUtil.getUserIdFromToken(token);
            String username = jwtTokenUtil.getUsernameFromToken(token);
            Date exp = jwtTokenUtil.getExpirationDateFromToken(token);
            List<String> roles = jwtTokenUtil.getClaimFromToken(token, claims -> claims.get("roles", List.class));

            Map<String, Object> body = new HashMap<>();
            body.put("valid", true);
            body.put("userID", userID);
            body.put("username", username);
            body.put("roles", roles);
            body.put("expiresAt", exp);

            return Mono.just(ResponseEntity
                    .ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body));
        } catch (Exception ex) {
            Map<String, Object> body = new HashMap<>();
            body.put("valid", false);
            body.put("message", "Token không hợp lệ");
            return Mono.just(ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body));
        }
    }


    @PostMapping("/logout")
    public Mono<ResponseEntity<?>> logout(ServerHttpRequest request, ServerHttpResponse response) {
        // 1) Lấy token từ cookie (hoặc header nếu bạn hỗ trợ header)
        HttpCookie jwtCookie = request.getCookies().getFirst("ACCESS-TOKEN");
        Mono<Void> maybeBlacklist = Mono.empty();

        if (jwtCookie != null) {
            String token = jwtCookie.getValue();

            // Lấy jti (hoặc toàn bộ token) và expiry
            String jti = jwtTokenUtil.getJtiFromToken(token); // bạn cần implement lấy jti
            Date exp = jwtTokenUtil.getExpirationDateFromToken(token);
            long ttlSeconds = Math.max(0, Duration.between(Instant.now(), exp.toInstant()).getSeconds());

            if (jti != null && ttlSeconds > 0) {
                String redisKey = "blacklist:jwt:" + jti;
                // Set value (ví dụ "1") với TTL = remaining seconds
                maybeBlacklist = redisTemplate.opsForValue()
                        .set(redisKey, "1", Duration.ofSeconds(ttlSeconds))
                        .then();
            }
        }

        // 2) Xóa cookie như trên
        ResponseCookie clearedJwt = ResponseCookie.from("ACCESS-TOKEN", "")
                .path("/")
                .httpOnly(true)
                .secure(true)
                .sameSite("Lax")
                .maxAge(Duration.ZERO)
                .build();

        ResponseCookie clearedCsrf = ResponseCookie.from("XSRF-TOKEN", "")
                .path("/")
                .httpOnly(false)
                .secure(true)
                .sameSite("Lax")
                .maxAge(Duration.ZERO)
                .build();

        response.addCookie(clearedJwt);
        response.addCookie(clearedCsrf);

        // 3) Sau khi blacklist xong (nếu có), trả về OK
        return maybeBlacklist.then(Mono.just(ResponseEntity.ok(Map.of("message", "Logout successful"))));
    }


}
