package com.example.Shopping_Cart_Service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShoppingCartDTO {
    private UUID id;
    private UUID userId;
    private List<CartItemDTO> items;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Instant createdAt;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Instant updatedAt;
}
