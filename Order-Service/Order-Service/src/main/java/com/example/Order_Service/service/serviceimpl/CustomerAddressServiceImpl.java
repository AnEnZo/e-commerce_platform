package com.example.Order_Service.service.serviceimpl;

import com.example.Order_Service.dto.CustomerAddressDTO;
import com.example.Order_Service.entity.CustomerAddress;
import com.example.Order_Service.mapper.CustomerAddressMapper;
import com.example.Order_Service.repository.CustomerAddressRepository;
import com.example.Order_Service.service.CustomerAddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CustomerAddressServiceImpl implements CustomerAddressService {

    private final CustomerAddressRepository repository;
    private final CustomerAddressMapper mapper;

    @Override
    public Flux<CustomerAddressDTO> getAllByUserId(UUID userId) {
        return repository.findAllByUserIdOrderByIsDefaultDesc(userId)
                .map(mapper::toDto);
    }

    @Override
    public Mono<CustomerAddressDTO> getById(UUID id) {
        return repository.findById(id).map(mapper::toDto);
    }

    /**
     * Create address. If dto.isDefault == true, unset previous default for the user.
     */
    @Override
    @Transactional // requires reactive transaction manager in config
    public Mono<CustomerAddressDTO> create(CustomerAddressDTO dto) {
        CustomerAddress entity = mapper.toEntity(dto);
        if (entity.getIsDefault() == null) entity.setIsDefault(false);

        if (Boolean.TRUE.equals(entity.getIsDefault())) {
            // unset previous default then save new
            return repository.findByUserIdAndIsDefaultTrue(entity.getUserId())
                    .flatMap(prev -> {
                        prev.setIsDefault(false);
                        return repository.save(prev);
                    })
                    .then(repository.save(entity))
                    .map(mapper::toDto);
        } else {
            return repository.save(entity).map(mapper::toDto);
        }
    }

    /**
     * Update fields of existing address.
     */
    @Override
    @Transactional
    public Mono<CustomerAddressDTO> update(UUID id, CustomerAddressDTO dto) {
        return repository.findById(id)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Address not found: " + id)))
                .flatMap(existing -> {
                    mapper.updateEntityFromDto(dto, existing);
                    if (existing.getIsDefault() == null) existing.setIsDefault(false);

                    if (Boolean.TRUE.equals(existing.getIsDefault())) {
                        // unset other default for this user (if any) then save
                        return repository.findByUserIdAndIsDefaultTrue(existing.getUserId())
                                .flatMap(prev -> {
                                    if (!prev.getId().equals(existing.getId())) {
                                        prev.setIsDefault(false);
                                        return repository.save(prev);
                                    }
                                    return Mono.just(prev);
                                })
                                .then(repository.save(existing))
                                .map(mapper::toDto);
                    } else {
                        return repository.save(existing).map(mapper::toDto);
                    }
                });
    }

    @Override
    public Mono<Void> delete(UUID id) {
        return repository.deleteById(id);
    }

    /**
     * Explicitly set an address as default for a user.
     */
    @Override
    @Transactional
    public Mono<CustomerAddressDTO> setDefault(UUID userId, UUID id) {
        // find target address
        Mono<CustomerAddress> targetMono = repository.findById(id)
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Address not found: " + id)))
                .filter(a -> a.getUserId().equals(userId))
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Address does not belong to user")));

        // unset previous default (if any) and set this one
        return repository.findByUserIdAndIsDefaultTrue(userId)
                .flatMap(prev -> {
                    if (!prev.getId().equals(id)) {
                        prev.setIsDefault(false);
                        return repository.save(prev);
                    }
                    return Mono.just(prev);
                })
                .then(targetMono.flatMap(target -> {
                    target.setIsDefault(true);
                    return repository.save(target);
                }))
                .map(mapper::toDto);
    }
}