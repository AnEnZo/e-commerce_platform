package com.example.Payment_Service.service.serviceimpl;

import com.example.Payment_Service.dto.LedgerEntryDto;
import com.example.Payment_Service.entity.LedgerEntry;
import com.example.Payment_Service.repository.LedgerEntryRepository;
import com.example.Payment_Service.service.LedgerEntryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class LedgerEntryServiceImpl implements LedgerEntryService {

    private final LedgerEntryRepository ledgerEntryRepository;

    public LedgerEntryServiceImpl(LedgerEntryRepository ledgerEntryRepository) {
        this.ledgerEntryRepository = ledgerEntryRepository;
    }

    @Override
    public Mono<LedgerEntryDto> createLedgerEntry(LedgerEntryDto dto) {
        LedgerEntry e = new LedgerEntry();
        e.setRelatedId(dto.getRelatedId());
        e.setRelatedType(dto.getRelatedType());
        e.setAccount(dto.getAccount());
        e.setAmount(dto.getAmount());
        e.setEntryType(dto.getEntryType());

        return ledgerEntryRepository.save(e)
                .map(saved -> new LedgerEntryDto(
                        saved.getId(), saved.getRelatedId(), saved.getRelatedType(),
                        saved.getAccount(), saved.getAmount(), saved.getEntryType(), saved.getCreatedAt()
                ));
    }

    @Override
    public Mono<LedgerEntryDto> getLedgerEntryById(UUID id) {
        return ledgerEntryRepository.findById(id)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "LedgerEntry not found")))
                .map(saved -> new LedgerEntryDto(
                        saved.getId(), saved.getRelatedId(), saved.getRelatedType(),
                        saved.getAccount(), saved.getAmount(), saved.getEntryType(), saved.getCreatedAt()
                ));
    }

    @Override
    public Flux<LedgerEntryDto> getAllLedgerEntries() {
        return ledgerEntryRepository.findAll()
                .map(e -> new LedgerEntryDto(
                        e.getId(), e.getRelatedId(), e.getRelatedType(),
                        e.getAccount(), e.getAmount(), e.getEntryType(), e.getCreatedAt()
                ));
    }

    @Override
    public Mono<Void> deleteLedgerEntry(UUID id) {
        return ledgerEntryRepository.deleteById(id);
    }
}
