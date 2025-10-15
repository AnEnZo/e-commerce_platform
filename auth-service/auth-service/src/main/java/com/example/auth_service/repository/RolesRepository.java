package com.example.auth_service.repository;


import com.example.auth_service.entity.Roles;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Optional;

public interface RolesRepository extends ReactiveCrudRepository<Roles, Long> {
        Mono<Roles> findByName(String name);
        Mono<Roles> findById(Long roleId);
}
