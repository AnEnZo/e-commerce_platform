package com.example.Order_Service.repository;

import com.example.Order_Service.entity.Order;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import org.springframework.stereotype.Repository;
import reactor.core.publisher.Flux;

import java.util.UUID;

@Repository
public interface OrderRepository extends R2dbcRepository<Order, UUID> {
    /**
     * Một số finder tiện ích. Trả về Flux vì có thể nhiều bản ghi.
     * Nếu bạn map status là enum OrderStatus, thay String bằng OrderStatus.
     */
    Flux<Order> findAllByUserId(Long userId);
    Flux<Order> findAllByShopId(UUID shopId);
    Flux<Order> findAllByOrderStatus(String status); // or Flux<Order> findAllByStatus(OrderStatus status);
}
