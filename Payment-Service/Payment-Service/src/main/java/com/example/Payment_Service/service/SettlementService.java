package com.example.Payment_Service.service;


import com.example.Payment_Service.dto.SettlementDto;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

public interface SettlementService {
    Mono<SettlementDto> createSettlement(SettlementDto settlementDto);
    Mono<SettlementDto> getSettlementById(UUID id);
    Flux<SettlementDto> getAllSettlements();
    Mono<Void> deleteSettlement(UUID id);
}
