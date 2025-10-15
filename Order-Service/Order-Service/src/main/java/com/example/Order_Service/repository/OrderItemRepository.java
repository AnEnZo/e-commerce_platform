package com.example.Order_Service.repository;

import com.example.Order_Service.entity.OrderItem;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import java.util.UUID;

@Repository
public interface OrderItemRepository extends R2dbcRepository<OrderItem, UUID> {
    /**
     * Lấy tất cả order items theo orderId (foreign key).
     * Trả về Flux vì reactive.
     */
    Flux<OrderItem> findAllByOrderId(UUID orderId);
}
