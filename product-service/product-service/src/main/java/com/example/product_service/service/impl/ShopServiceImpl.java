package com.example.product_service.service.impl;

import com.example.product_service.dto.PageResponse;
import com.example.product_service.dto.ShopDTO;
import com.example.product_service.ennum.VerificationStatus;
import com.example.product_service.entity.Shop;
import com.example.product_service.mapper.ShopMapper;
import com.example.product_service.repository.ShopRepository;
import com.example.product_service.service.ShopService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShopServiceImpl implements ShopService {

    private final ShopRepository shopRepository;
    private final ShopMapper shopMapper;

    @Override
    public Mono<ShopDTO> create(ShopDTO dto) {
        return shopRepository.existsByOwnerId(dto.getOwnerId()) // kiểm tra ownerId đã có shop chưa
                .flatMap(ownerExists -> {
                    if (Boolean.TRUE.equals(ownerExists)) {
                        return Mono.error(new IllegalArgumentException("Owner already has a shop"));
                    }
                    return shopRepository.existsByName(dto.getName())
                            .flatMap(nameExists -> {
                                if (Boolean.TRUE.equals(nameExists)) {
                                    return Mono.error(new IllegalArgumentException("Shop name already exists"));
                                }
                                dto.setVerificationStatus(VerificationStatus.unverified);
                                Shop shop = shopMapper.toEntity(dto);
                                return shopRepository.save(shop)
                                        .map(shopMapper::toDTO);
                            });
                });
    }


    @Override
    public Mono<ShopDTO> getById(UUID id) {
        return shopRepository.findById(id)
                .map(shopMapper::toDTO)
                .switchIfEmpty(Mono.error(new RuntimeException("Shop not found: " + id)));
    }

    @Override
    public Mono<PageResponse<ShopDTO>> getAll(int page, int size) {
        if (page < 0 || size <= 0) {
            return Mono.error(new IllegalArgumentException("Page must be >= 0 and size must be > 0"));
        }

        long skip = (long) page * size;

        Mono<Long> totalMono = shopRepository.count();
        Mono<List<ShopDTO>> contentMono = shopRepository.findAll()
                .skip(skip)
                .take(size)
                .map(shopMapper::toDTO)
                .collectList();

        return Mono.zip(totalMono, contentMono)
                .map(tuple -> {
                    long total = tuple.getT1();
                    List<ShopDTO> content = tuple.getT2();
                    int totalPages = (int) ((total + size - 1) / size);
                    PageResponse<ShopDTO> resp = new PageResponse<>();
                    resp.setContent(content);
                    resp.setTotalElements(total);
                    resp.setPage(page);
                    resp.setSize(size);
                    resp.setTotalPages(totalPages);
                    return resp;
                });
    }


    @Override
    public Mono<ShopDTO> update(UUID id, ShopDTO dto) {
        return shopRepository.findById(id)
                .switchIfEmpty(Mono.error(new RuntimeException("Shop not found: " + id)))
                .flatMap(existing -> {
                    shopMapper.updateEntityFromDto(dto, existing);
                    return shopRepository.save(existing)
                            .map(shopMapper::toDTO);
                });
    }

    @Override
    public Mono<Void> delete(UUID id) {
        return shopRepository.existsById(id)
                .flatMap(exists -> {
                    if (!Boolean.TRUE.equals(exists)) {
                        return Mono.error(new RuntimeException("Shop not found: " + id));
                    }
                    return shopRepository.deleteById(id);
                });
    }

    @Override
    public Mono<ShopDTO> getByOwnerId(UUID ownerId) {
        return shopRepository.findByOwnerId(ownerId)
                .map(shopMapper::toDTO);
    }

}
