package com.example.Payment_Service.mapper;



import com.example.Payment_Service.dto.CreatePaymentDto;
import com.example.Payment_Service.dto.PaymentResponseDTO;
import com.example.Payment_Service.ennum.PaymentStatus;
import com.example.Payment_Service.entity.Payment;
import org.mapstruct.*;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.util.UUID;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    /**
     * Map CreatePaymentDto -> Payment.
     * We intentionally do NOT set momoReference/qrCodeUrl here (those come from provider).
     * MapStruct will generate implementation.
     */
    Payment toEntity(CreatePaymentDto dto);

    /**
     * Map Payment -> PaymentResponseDTO (adjust fields in PaymentResponseDTO as needed).
     * If your PaymentResponseDTO has different field names, adapt mappings or DTO class.
     */
    PaymentResponseDTO toResponseDto(Payment payment);

    /**
     * After mapping hook: set defaults not provided by DTO.
     * MapStruct will call this after building the Payment object.
     */
    @AfterMapping
    default void afterCreate(@MappingTarget Payment target, CreatePaymentDto dto) {
        if (target.getId() == null) {
            target.setId(UUID.randomUUID());
        }
        if (!StringUtils.hasText(target.getCurrency())) {
            target.setCurrency(StringUtils.hasText(dto.getCurrency()) ? dto.getCurrency() : "VND");
        }
        if (target.getStatus() == null) {
            target.setStatus(PaymentStatus.INITIATED);
        }
        if (target.getCreatedAt() == null) {
            target.setCreatedAt(Instant.now());
        }
        // Ensure idempotencyKey is set if dto provided (MapStruct copies it automatically if names match).
    }
}
