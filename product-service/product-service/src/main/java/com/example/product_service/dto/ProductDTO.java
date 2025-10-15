package com.example.product_service.dto;


import com.example.product_service.ennum.ProductStatus;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductDTO {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private UUID id;
    private String name;
    private String barcode;
    private String description;
    private List<ProductImageDTO> images;
    private List<ProductVideoDTO> videos;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private ProductStatus status = ProductStatus.ACTIVE;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Long salesCount;
    private BigDecimal weight;
    private BigDecimal length;
    private BigDecimal width;
    private BigDecimal height;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private BigDecimal averageRating;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Integer reviewCount;
    private String slug;
    private String metaTitle;
    private String metaDescription;
    private Set<ProductVariantDTO> productVariants;
    private UUID categoryId;
    private UUID shopId;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Instant createdAt;
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private Instant updatedAt;

}
