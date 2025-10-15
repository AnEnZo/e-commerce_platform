package com.example.Shopping_Cart_Service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CartItemDTO {
    private UUID id;

    private UUID variantId;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String productName;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String productImageUrl;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String shopName;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private UUID shopId;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String color;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private String size;

    private Integer quantity;

    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Instant createdAt;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Instant updatedAt;
}
