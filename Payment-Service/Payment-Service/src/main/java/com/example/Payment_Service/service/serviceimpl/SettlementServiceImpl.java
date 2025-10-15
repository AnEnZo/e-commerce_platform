package com.example.Payment_Service.service.serviceimpl;


import com.example.Payment_Service.dto.SettlementDto;
import com.example.Payment_Service.entity.Settlement;
import com.example.Payment_Service.repository.SettlementRepository;
import com.example.Payment_Service.service.SettlementService;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@Service
public class SettlementServiceImpl implements SettlementService {

    private final SettlementRepository settlementRepository;

    public SettlementServiceImpl(SettlementRepository settlementRepository) {
        this.settlementRepository = settlementRepository;
    }

    @Override
    public Mono<SettlementDto> createSettlement(SettlementDto dto) {
        Settlement e = new Settlement();
        e.setShopId(dto.getShopId());
        e.setGrossAmount(dto.getGrossAmount());
        e.setFees(dto.getFees());
        e.setNetAmount(dto.getNetAmount());
        e.setStatus(dto.getStatus());
        e.setScheduledDate(dto.getScheduledDate());
        e.setPaidDate(dto.getPaidDate());
        e.setProviderPayoutId(dto.getProviderPayoutId());

        return settlementRepository.save(e)
                .map(this::toDto);
    }

    @Override
    public Mono<SettlementDto> getSettlementById(UUID id) {
        return settlementRepository.findById(id)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Settlement not found")))
                .map(this::toDto);
    }

    @Override
    public Flux<SettlementDto> getAllSettlements() {
        return settlementRepository.findAll()
                .map(this::toDto);
    }

    @Override
    public Mono<Void> deleteSettlement(UUID id) {
        return settlementRepository.deleteById(id);
    }

    // helper mapper
    private SettlementDto toDto(Settlement s) {
        return new SettlementDto(
                s.getId(),
                s.getShopId(),
                s.getGrossAmount(),
                s.getFees(),
                s.getNetAmount(),
                s.getStatus(),
                s.getScheduledDate(),
                s.getPaidDate(),
                s.getProviderPayoutId(),
                s.getCreatedAt(),
                s.getUpdatedAt()
        );
    }
}
