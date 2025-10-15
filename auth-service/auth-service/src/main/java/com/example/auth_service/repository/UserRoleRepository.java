package com.example.auth_service.repository;

import com.example.auth_service.entity.User;
import com.example.auth_service.entity.UserRole;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface UserRoleRepository extends ReactiveCrudRepository<UserRole, Long> {
    Flux<UserRole> findByUserId(UUID userId);
    Flux<UserRole> findAllByUserId(UUID userId);
    Mono<Void> deleteAllByUserId(UUID userId);
}
