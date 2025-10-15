package com.example.Payment_Service.controller;


import com.example.Payment_Service.dto.SettlementDto;
import com.example.Payment_Service.service.SettlementService;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.UUID;

@RestController
@RequestMapping("/api/settlements")
public class SettlementController {

    private final SettlementService settlementService;

    public SettlementController(SettlementService settlementService) {
        this.settlementService = settlementService;
    }

    @PostMapping
    public Mono<SettlementDto> createSettlement(@RequestBody Mono<SettlementDto> settlementDtoMono) {
        return settlementDtoMono.flatMap(settlementService::createSettlement);
    }

    @GetMapping("/{id}")
    public Mono<SettlementDto> getSettlementById(@PathVariable UUID id) {
        return settlementService.getSettlementById(id);
    }

    @GetMapping
    public Flux<SettlementDto> getAllSettlements() {
        return settlementService.getAllSettlements();
    }

    @DeleteMapping("/{id}")
    public Mono<Void> deleteSettlement(@PathVariable UUID id) {
        return settlementService.deleteSettlement(id);
    }
}
