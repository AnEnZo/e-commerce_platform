package com.example.Order_Service.service;

import com.example.Order_Service.dto.CustomerAddressDTO;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface CustomerAddressService {
    Flux<CustomerAddressDTO> getAllByUserId(UUID userId);
    Mono<CustomerAddressDTO> getById(UUID id);
    Mono<CustomerAddressDTO> create(CustomerAddressDTO dto);
    Mono<CustomerAddressDTO> update(UUID id, CustomerAddressDTO dto);
    Mono<Void> delete(UUID id);
    Mono<CustomerAddressDTO> setDefault(UUID userId, UUID id);
}
