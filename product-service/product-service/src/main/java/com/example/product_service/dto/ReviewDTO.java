package com.example.product_service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import java.time.Instant;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewDTO {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private UUID id;
    private Integer rating;
    private String comment;
    private UUID productId;
    private String reviewerName;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Instant createdAt;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Instant updatedAt;

}
