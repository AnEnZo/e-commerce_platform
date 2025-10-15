package com.example.Payment_Service.repository;

import com.example.Payment_Service.entity.LedgerEntry;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface LedgerEntryRepository extends R2dbcRepository<LedgerEntry, UUID> {
}
