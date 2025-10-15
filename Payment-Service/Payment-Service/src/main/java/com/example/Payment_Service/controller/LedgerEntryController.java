package com.example.Payment_Service.controller;

import com.example.Payment_Service.dto.LedgerEntryDto;
import com.example.Payment_Service.service.LedgerEntryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ledger-entries")
public class LedgerEntryController {

    @Autowired
    private LedgerEntryService ledgerEntryService;

    @PostMapping
    public Mono<LedgerEntryDto> createLedgerEntry(@RequestBody LedgerEntryDto ledgerEntryDto) {
        return ledgerEntryService.createLedgerEntry(ledgerEntryDto);
    }

    @GetMapping("/{id}")
    public Mono<LedgerEntryDto> getLedgerEntryById(@PathVariable UUID id) {
        return ledgerEntryService.getLedgerEntryById(id);
    }

    @GetMapping
    public Flux<LedgerEntryDto> getAllLedgerEntries() {
        return ledgerEntryService.getAllLedgerEntries();
    }

    @DeleteMapping("/{id}")
    public Mono<Void> deleteLedgerEntry(@PathVariable UUID id) {
        return ledgerEntryService.deleteLedgerEntry(id);
    }

}
