package com.example.Payment_Service.repository;

import com.example.Payment_Service.entity.Refund;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface RefundRepository extends R2dbcRepository<Refund, UUID> {
}
