package com.example.auth_service.service;

import com.example.auth_service.dto.RegisterRequest;
import com.example.auth_service.dto.UserDTO;
import com.example.auth_service.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

public interface UserService {
    Flux<UserDTO> getAllUsers(Pageable pageable);
    Mono<UserDTO> getUserById(UUID id);
    Mono<UserDTO> createUser(UserDTO userDTO);
    Mono<UserDTO> createStaff(UserDTO userDTO);
    Mono<UserDTO> updateUser(UUID id, UserDTO userDTO);
    Mono<Boolean> deleteUser(UUID id);
    Flux<UserDTO> searchUser(String username);
    Mono<Boolean> existsByUsername(String username);
    Mono<Boolean> existsByEmail(String email);
    Mono<UserDTO> registerNewUser(RegisterRequest registerRequest);
    Mono<User> findByEmail(String email);
    Mono<Void> updatePassword(User user, String rawPassword);
    Mono<User> findByUsername(String username);
    Mono<User> processOAuthUser(String provider, String providerId, String email, String username, String displayname);
    Mono<UserDTO> getUserByUsername(String username);
    Mono<UserDTO> updateCurrentUser(String username, Map<String, Object> updates);

}
