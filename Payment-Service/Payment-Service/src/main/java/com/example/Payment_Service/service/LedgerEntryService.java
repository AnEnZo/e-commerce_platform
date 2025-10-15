package com.example.Payment_Service.service;

import com.example.Payment_Service.dto.LedgerEntryDto;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

public interface LedgerEntryService {
    Mono<LedgerEntryDto> createLedgerEntry(LedgerEntryDto ledgerEntryDto);
    Mono<LedgerEntryDto> getLedgerEntryById(UUID id);
    Flux<LedgerEntryDto> getAllLedgerEntries();
    Mono<Void> deleteLedgerEntry(UUID id);
}
