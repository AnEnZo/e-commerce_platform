package com.example.product_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductVideoDTO {
    private UUID id;
    private String url;
    private Integer position;
    private String caption;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private boolean published;
    private Boolean isPrimary;
}
