package com.example.Order_Service.mapper;

import com.example.Order_Service.dto.OrderDTO;
import com.example.Order_Service.dto.OrderItemDTO;
import com.example.Order_Service.entity.Order;
import com.example.Order_Service.entity.OrderItem;
import org.mapstruct.AfterMapping;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.factory.Mappers;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderMapper {
    OrderMapper INSTANCE = Mappers.getMapper(OrderMapper.class);

    // MapStruct tự map các field cùng tên, enum OrderStatus sẽ map tự động nếu cả hai bên cùng kiểu
    OrderDTO toDto(Order order);

    Order toEntity(OrderDTO dto);

    List<OrderDTO> toDtoList(List<Order> orders);

    List<Order> toEntityList(List<OrderDTO> dtos);

    OrderItemDTO toDto(OrderItem item);
    OrderItem toEntity(OrderItemDTO dto);

    /**
     * Sau khi map OrderDTO -> Order, nếu order.id đã được set thì gắn orderId cho từng OrderItem.
     * Nếu order.id null thì không làm gì (thường bạn sẽ set UUID.randomUUID() trong service trước khi save).
     */
    @AfterMapping
    default void linkItemsToOrder(OrderDTO dto, @MappingTarget Order order) {
        if (order == null || order.getId() == null || order.getItems() == null) {
            return;
        }
        order.getItems().forEach(item -> item.setOrderId(order.getId()));
    }
}
