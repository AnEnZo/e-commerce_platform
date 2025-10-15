package com.example.auth_service.repository;




import com.example.auth_service.entity.User;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface UserRepository extends ReactiveCrudRepository<User, UUID> {
    Mono<User> findByUsername(String username);
    Mono<User> findByEmail(String email);
    Flux<User> findByUsernameContainingIgnoreCase(String keyword);
}
