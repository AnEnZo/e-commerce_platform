package com.example.Order_Service.service;

import com.example.Order_Service.dto.OrderDTO;
import com.example.Order_Service.ennum.PaymentStatus;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;

public interface OrderService {
    Mono<OrderDTO> createOrder(OrderDTO dto);
    Mono<OrderDTO> getOrderById(UUID id);
    Flux<OrderDTO> getAllOrders();
    Mono<OrderDTO> updateOrder(UUID id, OrderDTO dto);
    Mono<Void> deleteOrder(UUID id);
    Mono<Void> updatePaymentStatus(UUID orderId, PaymentStatus status, String providerReference);
    Flux<OrderDTO> createOrdersByShop(List<OrderDTO> orders);
}

