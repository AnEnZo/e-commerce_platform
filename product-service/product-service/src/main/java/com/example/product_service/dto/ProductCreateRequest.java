package com.example.product_service.dto;

import jakarta.validation.Valid;
import lombok.*;
import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductCreateRequest {
    @NotBlank
    @Size(max = 50)
    private String name;

    @Size(max = 100)
    private String barcode;

    private String description;

    @NotNull
    private UUID categoryId;

    @NotNull
    private UUID shopId;

    @PositiveOrZero
    private BigDecimal weight;

    @PositiveOrZero
    private BigDecimal length;

    @PositiveOrZero
    private BigDecimal width;

    @PositiveOrZero
    private BigDecimal height;

    private Set<ProductVariantDTO> productVariants;

    @Valid
    private List<MediaItemDTO> images;

    @Valid
    private List<MediaItemDTO> videos;
}

