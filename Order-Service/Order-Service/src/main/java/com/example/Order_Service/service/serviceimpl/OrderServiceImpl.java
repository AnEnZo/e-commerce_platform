package com.example.Order_Service.service.serviceimpl;

import com.example.Order_Service.client.VoucherServiceClient;
import com.example.Order_Service.dto.OrderDTO;
import com.example.Order_Service.dto.VoucherApplyRequestDTO;
import com.example.Order_Service.ennum.OrderStatus;
import com.example.Order_Service.entity.Order;
import com.example.Order_Service.ennum.PaymentStatus;
import com.example.Order_Service.entity.OrderItem;
import com.example.Order_Service.kafkaproducer.SalesEventProducer;
import com.example.Order_Service.mapper.OrderMapper;
import com.example.Order_Service.repository.OrderItemRepository;
import com.example.Order_Service.repository.OrderRepository;
import com.example.Order_Service.service.OrderService;
import lombok.AllArgsConstructor;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.reactive.TransactionalOperator;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class OrderServiceImpl implements OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderServiceImpl.class);
    private final VoucherServiceClient voucherServiceClient;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final OrderMapper orderMapper;
    private final TransactionalOperator txOperator;
    private final SalesEventProducer salesEventProducer;
    private static final int MAX_RETRIES = 3;

    @Override
    public Mono<OrderDTO> createOrder(OrderDTO dto) {
        Order order = orderMapper.toEntity(dto);
        // ensure id
        if (order.getId() == null) {
            order.setId(UUID.randomUUID());
        }
        // ensure items list not null
        if (order.getItems() == null) order.setItems(new ArrayList<>());

        // ensure items have ids and orderId
        order.getItems().forEach(item -> {
            item.setId(null);
            item.setOrderId(order.getId());
        });

        order.recalculateTotal();

        return attemptSave(order, 1);
    }

    private Mono<OrderDTO> attemptSave(Order order, int attempt) {
        return txOperator.execute(status ->
                        orderRepository.save(order)
                                .flatMap(savedOrder -> {
                                    List<OrderItem> items = order.getItems() == null ? List.of() : order.getItems();
                                    items.forEach(it -> it.setOrderId(savedOrder.getId()));
                                    return orderItemRepository.saveAll(items)
                                            .collectList()
                                            .map(savedItems -> {
                                                savedOrder.setItems(savedItems);
                                                return savedOrder;
                                            });
                                })
                )
                .single() // Mono<Order> - result after transaction commits
                .flatMap(savedOrder -> {
                    // map to DTO now (outside transaction)
                    OrderDTO dto = orderMapper.toDto(savedOrder);

                    // 1) If no voucher in request, continue normal flow (send events and return DTO)
                    if (dto.getVoucherShopId() == null && dto.getVoucherPlatformId() == null) {
                        return sendSaleEventsAndReturnDto(savedOrder, dto);
                    }

                    // 2) Handle voucher application
                    return applyVoucherAndHandleResponse(dto, savedOrder);
                })
                .onErrorResume(ex -> {
                    // Transaction-level error handling (duplicate PK etc.)
                    String rootMsg = ExceptionUtils.getRootCauseMessage(ex).toLowerCase();
                    boolean isPkCollision = (rootMsg.contains("duplicate") || rootMsg.contains("unique") ||
                            (rootMsg.contains("constraint") && rootMsg.contains("pk")));
                    if (isPkCollision && attempt < MAX_RETRIES) {
                        log.warn("UUID collision detected when saving Order (attempt {}/{}) - regenerating IDs and retrying...", attempt, MAX_RETRIES);
                        // regenerate ids and retry
                        order.setId(UUID.randomUUID());
                        if (order.getItems() != null) {
                            order.getItems().forEach(it -> {
                                it.setId(UUID.randomUUID());
                                it.setOrderId(order.getId());
                            });
                        }
                        return attemptSave(order, attempt + 1);
                    }
                    return Mono.error(ex);
                });
    }

    private Mono<OrderDTO> applyVoucherAndHandleResponse(OrderDTO dto, Order savedOrder) {
        // Create request DTO for voucher service
        VoucherApplyRequestDTO request = new VoucherApplyRequestDTO();
        request.setVoucherShopId(dto.getVoucherShopId());
        request.setVoucherPlatformId(dto.getVoucherPlatformId());
        request.setOrderAmount(dto.getTotalAmount());
        request.setUserId(dto.getUserId());
        request.setCategoryId(dto.getCategoryId());

        // Call voucher-service to apply voucher
        return voucherServiceClient.applyVoucher(request)
                .flatMap(response -> {
                    if (!response.isSuccess()) {
                        // If voucher application fails, return error with failure reason
                        return Mono.error(new RuntimeException("Voucher application failed: " + response.getFailureReason()));
                    }

                    // Update order total with discount and proceed
                    savedOrder.setTotalAmount(response.getFinalAmount());
                    return orderRepository.save(savedOrder)
                            .flatMap(updatedOrder -> sendSaleEventsAndReturnDto(updatedOrder, dto));
                });
    }

    @Override
    public Mono<OrderDTO> getOrderById(UUID id) {
        return orderRepository.findById(id)
                .switchIfEmpty(Mono.error(new RuntimeException("Order not found")))
                .flatMap(order ->
                        orderItemRepository.findAllByOrderId(order.getId())
                                .collectList()
                                .map(items -> {
                                    order.setItems(items);
                                    return orderMapper.toDto(order);
                                })
                );
    }

    @Override
    public Flux<OrderDTO> getAllOrders() {
        return orderRepository.findAll()
                .flatMap(order ->
                        orderItemRepository.findAllByOrderId(order.getId())
                                .collectList()
                                .map(items -> {
                                    order.setItems(items);
                                    return orderMapper.toDto(order);
                                })
                );
    }

    @Override
    public Mono<OrderDTO> updateOrder(UUID id, OrderDTO dto) {
        return txOperator.execute(status ->
                orderRepository.findById(id)
                        .switchIfEmpty(Mono.error(new RuntimeException("Order not found")))
                        .flatMap(existing -> {
                            Order updated = orderMapper.toEntity(dto);
                            updated.setId(existing.getId());
                            if (updated.getItems() == null) updated.setItems(new ArrayList<>());

                            updated.getItems().forEach(it -> {
                                if (it.getId() == null) it.setId(UUID.randomUUID());
                                it.setOrderId(updated.getId());
                            });

                            updated.recalculateTotal();

                            return orderRepository.save(updated)
                                    .flatMap(savedOrder ->
                                            // delete old items, then save new ones and collect to list
                                            orderItemRepository.findAllByOrderId(savedOrder.getId())
                                                    .flatMap(orderItemRepository::delete)
                                                    .then(
                                                            Flux.fromIterable(updated.getItems())
                                                                    .flatMap(orderItemRepository::save)
                                                                    .collectList()
                                                    )
                                                    .map(savedItems -> {
                                                        savedOrder.setItems(savedItems);
                                                        return orderMapper.toDto(savedOrder);
                                                    })
                                    );
                        })
        ).single();
    }

    @Override
    public Mono<Void> deleteOrder(UUID id) {
        return txOperator.execute(status ->
                orderItemRepository.findAllByOrderId(id)
                        .flatMap(orderItemRepository::delete)
                        .then(orderRepository.deleteById(id))
        ).then();
    }

    @Override
    public Mono<Void> updatePaymentStatus(UUID orderId, PaymentStatus status, String providerReference) {
        return orderRepository.findById(orderId)
                .switchIfEmpty(Mono.error(new RuntimeException("Order not found")))
                .flatMap(order -> {
                    switch (status) {
                        case SUCCESS -> order.setOrderStatus(OrderStatus.CONFIRMED);
                        case FAILED, CANCELLED -> order.setOrderStatus(OrderStatus.CANCELLED);
                        default -> {}
                    }
                    order.setPaymentStatus(status);
                    return orderRepository.save(order).then();
                });
    }


    private Mono<OrderDTO> sendSaleEventsAndReturnDto(Order savedOrder, OrderDTO dto) {
        Map<UUID, Long> aggByProduct = savedOrder.getItems().stream()
                .collect(Collectors.groupingBy(
                        OrderItem::getProductId,
                        Collectors.summingLong(OrderItem::getQuantity)
                ));

        List<Mono<?>> sendMonos = aggByProduct.entrySet().stream()
                .map(e -> {
                    UUID eventId = UUID.randomUUID();
                    UUID productId = e.getKey();
                    long qty = e.getValue();
                    return salesEventProducer.sendSaleEvent(eventId, savedOrder.getId(), productId, qty)
                            .then()
                            .onErrorResume(err -> {
                                log.warn("Failed to send sale event for product {} (order={}): {}", productId, savedOrder.getId(), err.getMessage());
                                return Mono.empty();
                            });
                })
                .collect(Collectors.toList());

        Mono<Void> allSends = sendMonos.isEmpty() ? Mono.empty() : Mono.whenDelayError(sendMonos);
        return allSends.thenReturn(dto);
    }

    @Override
    public Flux<OrderDTO> createOrdersByShop(List<OrderDTO> orders) {
        return Flux.fromIterable(orders)
                .flatMap(orderDto -> {
                    Order order = orderMapper.toEntity(orderDto);
                    if (order.getId() == null) {
                        order.setId(UUID.randomUUID());
                    }
                    if (order.getItems() == null) {
                        order.setItems(new ArrayList<>());
                    }
                    order.getItems().forEach(item -> {
                        item.setId(null);
                        item.setOrderId(order.getId());
                    });
                    order.recalculateTotal();

                    return txOperator.execute(status ->
                            orderRepository.save(order)
                                    .flatMap(savedOrder -> {
                                        List<OrderItem> items = order.getItems();
                                        items.forEach(it -> it.setOrderId(savedOrder.getId()));
                                        return orderItemRepository.saveAll(items)
                                                .collectList()
                                                .map(savedItems -> {
                                                    savedOrder.setItems(savedItems);
                                                    return savedOrder;
                                                });
                                    })
                    ).single()
                            .flatMap(savedOrder -> {
                                OrderDTO dto = orderMapper.toDto(savedOrder);
                                return sendSaleEventsAndReturnDto(savedOrder, dto);
                            });
                });
    }
}
