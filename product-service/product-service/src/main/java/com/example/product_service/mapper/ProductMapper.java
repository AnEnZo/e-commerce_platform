package com.example.product_service.mapper;

import com.example.product_service.document.ProductDocument;
import com.example.product_service.document.ProductVariantDocument;
import com.example.product_service.dto.ProductDTO;
import com.example.product_service.dto.ProductImageDTO;
import com.example.product_service.dto.ProductVariantDTO;
import com.example.product_service.dto.ProductVideoDTO;
import com.example.product_service.entity.Product;
import com.example.product_service.entity.ProductImage;
import com.example.product_service.entity.ProductVariant;
import com.example.product_service.entity.ProductVideo;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.LinkedHashSet;
import java.util.stream.Collectors;

/**
 * Mapper adapted for R2DBC where relationships are loaded separately (no JPA-style automatic collections).
 */
@Mapper(componentModel = "spring")
public interface ProductMapper {

    // Map product core fields only (no images/videos/variants inside entity)
    ProductDTO toDto(Product product);
    Product toEntity(ProductDTO dto);

    ProductDTO toDtoFromDocument(ProductDocument doc);


    List<ProductDTO> toDtoList(List<Product> entities);
    List<Product> toEntityList(List<ProductDTO> dtos);

    // Image/video/variant element mappings
    ProductImageDTO toImageDto(ProductImage image);
    ProductImage toImageEntity(ProductImageDTO dto);
    List<ProductImageDTO> toImageDtoList(List<ProductImage> images);
    List<ProductImage> toImageEntityList(List<ProductImageDTO> dtos);

    ProductVideoDTO toVideoDto(ProductVideo video);
    ProductVideo toVideoEntity(ProductVideoDTO dto);
    List<ProductVideoDTO> toVideoDtoList(List<ProductVideo> videos);
    List<ProductVideo> toVideoEntityList(List<ProductVideoDTO> dtos);

    ProductVariantDTO toVariantDto(ProductVariant variant);
    ProductVariant toVariantEntity(ProductVariantDTO dto);
    List<ProductVariantDTO> toVariantDtoList(List<ProductVariant> variants);
    List<ProductVariant> toVariantEntityList(List<ProductVariantDTO> dtos);

    // Update only mutable product fields from DTO (ignore id/version/timestamps)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromDto(ProductDTO dto, @MappingTarget Product entity);

    // ----- Helpers for R2DBC use-cases -----
    default ProductDTO toDto(Product product, List<ProductImage> images, List<ProductVideo> videos, List<ProductVariant> variants) {
        if (product == null) return null;

        ProductDTO dto = toDto(product);

        dto.setImages(images == null ? List.of() : toImageDtoList(images));
        dto.setVideos(videos == null ? List.of() : toVideoDtoList(videos));

        // ProductDTO.productVariants is a Set — convert the loaded List<ProductVariant> into a Set<ProductVariantDTO>
        if (variants == null || variants.isEmpty()) {
            dto.setProductVariants(Set.of());
        } else {
            Set<ProductVariantDTO> variantSet = variants.stream()
                    .map(this::toVariantDto)
                    .collect(Collectors.toCollection(LinkedHashSet::new));
            dto.setProductVariants(variantSet);
        }

        return dto;
    }

    /**
     * Convert DTO lists into entity lists and set productId on each child entity.
     */
    default List<ProductImage> toImageEntityListWithProductId(List<ProductImageDTO> dtos, UUID productId) {
        if (dtos == null) return List.of();
        return dtos.stream().map(d -> {
            ProductImage e = toImageEntity(d);
            e.setProductId(productId);
            if (e.getId() == null) e.setId(UUID.randomUUID());
            return e;
        }).collect(Collectors.toList());
    }

    default List<ProductVideo> toVideoEntityListWithProductId(List<ProductVideoDTO> dtos, UUID productId) {
        if (dtos == null) return List.of();
        return dtos.stream().map(d -> {
            ProductVideo e = toVideoEntity(d);
            e.setProductId(productId);
            if (e.getId() == null) e.setId(UUID.randomUUID());
            return e;
        }).collect(Collectors.toList());
    }

    default List<ProductVariant> toVariantEntityListWithProductId(List<ProductVariantDTO> dtos, UUID productId) {
        if (dtos == null) return List.of();
        return dtos.stream().map(d -> {
            ProductVariant e = toVariantEntity(d);
            e.setProductId(productId);
            if (e.getId() == null) e.setId(UUID.randomUUID());
            return e;
        }).collect(Collectors.toList());
    }

    // ----- Elasticsearch document conversion (accept collections separately) -----
    default ProductDocument toDocument(Product product, List<ProductImage> images, List<ProductVideo> videos, List<ProductVariant> variants) {
        if (product == null) return null;

        ProductDocument doc = new ProductDocument();
        doc.setId(product.getId() != null ? product.getId().toString() : null);
        doc.setName(product.getName());
        doc.setDescription(product.getDescription());

        doc.setImageUrls(images == null ? List.of() : images.stream().map(ProductImage::getUrl).filter(u -> u != null).collect(Collectors.toList()));
        doc.setVideoUrls(videos == null ? List.of() : videos.stream().map(ProductVideo::getUrl).filter(u -> u != null).collect(Collectors.toList()));

        doc.setStatus(product.getStatus() != null ? product.getStatus().name() : null);
        doc.setSalesCount(product.getSalesCount());
        doc.setWeight(product.getWeight() != null ? product.getWeight().doubleValue() : null);
        doc.setLength(product.getLength() != null ? product.getLength().doubleValue() : null);
        doc.setWidth(product.getWidth() != null ? product.getWidth().doubleValue() : null);
        doc.setHeight(product.getHeight() != null ? product.getHeight().doubleValue() : null);
        doc.setAverageRating(product.getAverageRating() != null ? product.getAverageRating().doubleValue() : null);
        doc.setReviewCount(product.getReviewCount());
        doc.setSlug(product.getSlug());
        doc.setMetaTitle(product.getMetaTitle());
        doc.setMetaDescription(product.getMetaDescription());

        // Product entity does not contain categoryName/shopName fields in your model.
        // If you need names in the document, fetch them in service layer and set on the document there before indexing.
        if (product.getCategoryId() != null) {
            doc.setCategoryId(product.getCategoryId().toString());
        }
        if (product.getShopId() != null) {
            doc.setShopId(product.getShopId().toString());
        }

        doc.setVariants(variants == null ? Set.of() : variants.stream().map(this::toVariantDocument).collect(Collectors.toSet()));

        return doc;
    }

    default ProductVariantDocument toVariantDocument(ProductVariant variant) {
        if (variant == null) return null;
        ProductVariantDocument doc = new ProductVariantDocument();
        doc.setId(variant.getId() != null ? variant.getId().toString() : null);
        doc.setSku(variant.getSku());
        doc.setColor(variant.getColor());
        doc.setSize(variant.getSize());
        doc.setQuantityOnHand(variant.getQuantityOnHand());
        doc.setSalePrice(variant.getSalePrice() != null ? variant.getSalePrice().doubleValue() : null);
        doc.setBasePrice(variant.getBasePrice() != null ? variant.getBasePrice().doubleValue() : null);
        return doc;
    }

    // helpers
    default String uuidToString(UUID id) { return id == null ? null : id.toString(); }
    default UUID stringToUuid(String s) { if (s == null) return null; try { return UUID.fromString(s); } catch (IllegalArgumentException ex) { return null; } }

    /**
     * Map ProductCreateRequest -> Product entity (core fields).
     * MapStruct will map same-named fields automatically.
     */
    Product toEntityFromCreateRequest(com.example.product_service.dto.ProductCreateRequest req);

    /**
     * Map MediaItemDTO -> ProductImage / ProductVideo entity.
     * We use explicit method names to avoid collision with existing DTO types.
     */
    ProductImage toImageEntityFromMedia(com.example.product_service.dto.MediaItemDTO media);
    ProductVideo toVideoEntityFromMedia(com.example.product_service.dto.MediaItemDTO media);

    /**
     * Bulk helpers (default) to set productId + generate id when missing.
     */
    default java.util.List<ProductImage> toImageEntityListFromMedia(java.util.List<com.example.product_service.dto.MediaItemDTO> dtos, java.util.UUID productId) {
        if (dtos == null) return java.util.List.of();
        return dtos.stream()
                .map(this::toImageEntityFromMedia)
                .map(e -> {
                    e.setProductId(productId);
                    if (e.getId() == null) e.setId(java.util.UUID.randomUUID());
                    return e;
                })
                .collect(Collectors.toList());
    }

    default java.util.List<ProductVideo> toVideoEntityListFromMedia(java.util.List<com.example.product_service.dto.MediaItemDTO> dtos, java.util.UUID productId) {
        if (dtos == null) return java.util.List.of();
        return dtos.stream()
                .map(this::toVideoEntityFromMedia)
                .map(e -> {
                    e.setProductId(productId);
                    if (e.getId() == null) e.setId(java.util.UUID.randomUUID());
                    return e;
                })
                .collect(Collectors.toList());
    }


}
