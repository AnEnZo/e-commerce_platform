package com.example.Order_Service.repository;

import com.example.Order_Service.entity.CustomerAddress;
import org.springframework.data.repository.reactive.ReactiveCrudRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface CustomerAddressRepository extends ReactiveCrudRepository<CustomerAddress, UUID> {
    Flux<CustomerAddress> findAllByUserId(UUID userId);
    Mono<CustomerAddress> findByUserIdAndIsDefaultTrue(UUID userId);
    // optional: get ordered by isDefault so default shows first
    Flux<CustomerAddress> findAllByUserIdOrderByIsDefaultDesc(UUID userId);
}