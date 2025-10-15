package com.example.auth_service.controller;


import com.example.auth_service.dto.ResetPasswordRequest;
import com.example.auth_service.dto.UserDTO;
import com.example.auth_service.security.CustomUserDetails;
import com.example.auth_service.service.EmailOtpService;
import com.example.auth_service.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@SecurityRequirement(name = "bearerAuth")
@AllArgsConstructor
public class UserController {

    private final UserService userService;
    private final EmailOtpService emailOtpService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public Mono<ResponseEntity<Flux<UserDTO>>> getAllUsers(
            @PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Flux<UserDTO> users = userService.getAllUsers(pageable);
        return Mono.just(ResponseEntity.ok(users));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public Mono<ResponseEntity<UserDTO>> getUserById(@PathVariable UUID id) {
        return userService.getUserById(id)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PostMapping("/user")
    @PreAuthorize("hasRole('ADMIN')")
    public Mono<ResponseEntity<UserDTO>> createUser(@Valid @RequestBody UserDTO userDTO) {
        return userService.createUser(userDTO)
                .map(u -> ResponseEntity.status(HttpStatus.CREATED).body(u))
                .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().build()));
    }

    @PostMapping("/staff")
    @PreAuthorize("hasRole('ADMIN')")
    public Mono<ResponseEntity<UserDTO>> createStaff(@Valid @RequestBody UserDTO userDTO) {
        return userService.createStaff(userDTO)
                .map(u -> ResponseEntity.status(HttpStatus.CREATED).body(u))
                .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().build()));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Mono<ResponseEntity<Void>> deleteUser(@PathVariable UUID id) {
        return userService.deleteUser(id)
                .map(deleted -> deleted ? ResponseEntity.noContent().<Void>build() : ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN')")
    public Flux<UserDTO> searchUser(@RequestParam String keyword) {
        return userService.searchUser(keyword);
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public Mono<UserDTO> getCurrentUser(@AuthenticationPrincipal CustomUserDetails currentUser) {
        return userService.getUserByUsername(currentUser.getUsername());
    }

    @PatchMapping("/me")
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public Mono<ResponseEntity<UserDTO>> updateCurrentUser(
            @AuthenticationPrincipal CustomUserDetails currentUser,
            @RequestBody Map<String, Object> updates
    ) {
        return userService.updateCurrentUser(currentUser.getUsername(), updates)
                .map(ResponseEntity::ok)
                .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().build()));
    }

    @PostMapping("/reset-password")
    @PreAuthorize("hasAnyRole('USER','ADMIN','STAFF')")
    public Mono<ResponseEntity<String>> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        return emailOtpService.validateOtpAndGetUser(req.getUsername(), req.getOtp()) // Mono<User>
                .flatMap(user -> userService.updatePassword(user, req.getNewPassword())
                        .thenReturn("Password đã được cập nhật thành công"))
                .map(msg -> ResponseEntity.ok(msg))
                .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().body(e.getMessage())));
    }

}

