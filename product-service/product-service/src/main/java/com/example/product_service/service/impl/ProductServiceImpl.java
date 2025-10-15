package com.example.product_service.service.impl;

import com.example.product_service.document.ProductDocument;
import com.example.product_service.dto.*;
import com.example.product_service.ennum.ProductStatus;
import com.example.product_service.entity.Category;
import com.example.product_service.entity.Product;
import com.example.product_service.entity.ProductVariant;
import com.example.product_service.entity.Shop;
import com.example.product_service.entity.ProductImage;
import com.example.product_service.entity.ProductVideo;
import com.example.product_service.mapper.ProductMapper;
import com.example.product_service.mapper.ProductVariantInfoMapper;
import com.example.product_service.repository.*;
import com.example.product_service.service.ProductService;

import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.*;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
@Transactional
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductR2DBCRepository productR2DBCRepository;
    private final ProductVariantRepository variantRepository;
    private final ProductImageRepository productImageRepository;
    private final ProductVideoRepository productVideoRepository;
    private final ProductDocumentRepository productElasticSearchRepository; // Elasticsearch repo
    private final CategoryRepository categoryRepository;
    private final ShopRepository shopRepository;
    private final ProductMapper productMapper;
    private final ProductVariantInfoMapper productVariantInfoMapper;
    private static final int LOW_STOCK_THRESHOLD = 20;

    // --------------------- Queries ---------------------

    @Override
    public Mono<PageResponse<ProductDTO>> getAllProduct(Pageable pageable) {
        // 1) Flux<ProductDTO> cho trang hiện tại (map từng product -> ProductDTO bằng các repo phụ)
        Flux<ProductDTO> dtoFlux = productR2DBCRepository.findAllBy(pageable)
                .flatMap(product ->
                        Mono.zip(
                                        productImageRepository.findByProductId(product.getId()).collectList(),
                                        productVideoRepository.findByProductId(product.getId()).collectList(),
                                        variantRepository.findByProductId(product.getId()).collectList()
                                )
                                .map(tuple -> productMapper.toDto(product, tuple.getT1(), tuple.getT2(), tuple.getT3()))
                );

        // 2) Collect page content -> Mono<List<ProductDTO>>
        Mono<List<ProductDTO>> contentMono = dtoFlux.collectList();

        // 3) Count tổng số phần tử
        Mono<Long> countMono = productR2DBCRepository.count();

        // 4) Zip content + count -> PageResponse
        return contentMono.zipWith(countMono)
                .map(tuple -> {
                    List<ProductDTO> content = tuple.getT1();
                    long total = tuple.getT2();
                    int totalPages = pageable.getPageSize() > 0
                            ? (int) Math.ceil((double) total / pageable.getPageSize())
                            : 0;
                    return new PageResponse<>(content, total, pageable.getPageNumber(), pageable.getPageSize(), totalPages);
                });
    }

    @Override
    public Mono<ProductDTO> getProductById(UUID id) {
        return productR2DBCRepository.findById(id)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Product not found")))
                .flatMap(product -> Mono.zip(
                        productImageRepository.findByProductId(product.getId()).collectList(),
                        productVideoRepository.findByProductId(product.getId()).collectList(),
                        variantRepository.findByProductId(product.getId()).collectList()
                ).map(tuple -> productMapper.toDto(product, tuple.getT1(), tuple.getT2(), tuple.getT3())));
    }

    @Override
    public Flux<ProductDTO> getProductByCategory(String categoryName, Pageable pageable) {
        int limit = pageable.getPageSize();
        int offset = (int) pageable.getOffset(); // chú ý cast nếu chắc offset < Integer.MAX_VALUE

        return categoryRepository.existsByName(categoryName)
                .flatMapMany(exists -> {
                    if (!exists) {
                        return Flux.error(new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "Category '" + categoryName + "' not found"));
                    }
                    return productR2DBCRepository.findByCategoryNameWithPagination(categoryName, limit, offset)
                            .flatMap(product -> Mono.zip(
                                    productImageRepository.findByProductId(product.getId()).collectList(),
                                    productVideoRepository.findByProductId(product.getId()).collectList(),
                                    variantRepository.findByProductId(product.getId()).collectList()
                            ).map(tuple -> productMapper.toDto(product, tuple.getT1(), tuple.getT2(), tuple.getT3())));
                });
    }


    // ---------------- Create ----------------

    @Override
    public Mono<ProductDTO> createProduct(ProductCreateRequest createRequest) {
        // (optional) validate input basic: e.g. ensure images/video urls not null, ensure category/shop present
        // check category & shop exist
        return categoryRepository.findById(createRequest.getCategoryId())
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Category not found with id " + createRequest.getCategoryId())))
                .zipWith(shopRepository.findById(createRequest.getShopId())
                        .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND,
                                "Shop not found with id " + createRequest.getShopId()))))
                .flatMap(tuple -> {
                    // Map createRequest -> Product entity (core fields)
                    Product product = productMapper.toEntityFromCreateRequest(createRequest);
                    // ensure id generated
                    if (product.getId() == null) product.setId(UUID.randomUUID());
                    product.setCategoryId(tuple.getT1().getId());
                    product.setShopId(tuple.getT2().getId());
                    if (product.getStatus() == null) product.setStatus(ProductStatus.ACTIVE);

                    return productR2DBCRepository.save(product)
                            .flatMap(saved -> {
                                UUID pid = saved.getId();

                                // variants (if any) : use existing helper to map ProductVariantDTO -> ProductVariant with productId
                                List<ProductVariant> variantEntities = new ArrayList<>();
                                if (createRequest.getProductVariants() != null && !createRequest.getProductVariants().isEmpty()) {
                                    variantEntities = productMapper.toVariantEntityListWithProductId(
                                            new ArrayList<>(createRequest.getProductVariants()), pid);
                                }

                                // images from MediaItemDTO -> ProductImage
                                List<ProductImage> imageEntities = productMapper.toImageEntityListFromMedia(createRequest.getImages(), pid);

                                // videos from MediaItemDTO -> ProductVideo
                                List<ProductVideo> videoEntities = productMapper.toVideoEntityListFromMedia(createRequest.getVideos(), pid);

                                Mono<List<ProductVariant>> savedVariantsMono = variantEntities.isEmpty()
                                        ? Mono.just(List.<ProductVariant>of())
                                        : Flux.fromIterable(variantEntities).collectList().flatMapMany(variantRepository::saveAll).collectList();

                                Mono<List<ProductImage>> savedImagesMono = imageEntities.isEmpty()
                                        ? Mono.just(List.<ProductImage>of())
                                        : Flux.fromIterable(imageEntities).collectList().flatMapMany(productImageRepository::saveAll).collectList();

                                Mono<List<ProductVideo>> savedVideosMono = videoEntities.isEmpty()
                                        ? Mono.just(List.<ProductVideo>of())
                                        : Flux.fromIterable(videoEntities).collectList().flatMapMany(productVideoRepository::saveAll).collectList();

                                return Mono.zip(savedImagesMono, savedVideosMono, savedVariantsMono)
                                        .flatMap(tupleChildren -> {
                                            List<ProductImage> imgs = tupleChildren.getT1();
                                            List<ProductVideo> vids = tupleChildren.getT2();
                                            List<ProductVariant> vars = tupleChildren.getT3();

                                            // Ensure exactly one primary image if needed
                                            enforceSinglePrimaryImage(imgs);

                                            // index ES (fire and forget)
                                            ProductDocument doc = productMapper.toDocument(saved, imgs, vids, vars);
                                            return productElasticSearchRepository.save(doc)
                                                    .onErrorResume(e -> {
                                                        log.error("Sync to ES failed: {}", e.getMessage(), e);
                                                        return Mono.empty();
                                                    })
                                                    .thenReturn(productMapper.toDto(saved, imgs, vids, vars));
                                        });
                            });
                });
    }


    // ---------------- Delete ----------------
    @Override
    public Mono<Void> deleteProduct(UUID id) {
        return Mono.when(
                        productImageRepository.deleteByProductId(id),
                        productVideoRepository.deleteByProductId(id),
                        variantRepository.deleteByProductId(id)
                ).then(productR2DBCRepository.deleteById(id))
                .then(productElasticSearchRepository.deleteById(id.toString()).onErrorResume(e -> {
                    log.warn("Failed delete ES: {}", e.getMessage());
                    return Mono.empty();
                }));
    }

    // --------------------- Update ---------------------

    @Override
    public Mono<ProductDTO> updateProduct(UUID id, ProductDTO productDTO) {
        return productR2DBCRepository.findById(id)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "Product not found with id " + id)))
                .flatMap(existing -> {
                    productMapper.updateEntityFromDto(productDTO, existing);
                    // handle category/shop change reactively
                    Mono<Void> catCheck = Mono.empty();
                    if (productDTO.getCategoryId() != null) {
                        catCheck = categoryRepository.findById(productDTO.getCategoryId())
                                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND,
                                        "Category not found with id " + productDTO.getCategoryId())))
                                .doOnNext(cat -> existing.setCategoryId(cat.getId()))
                                .then();
                    }
                    Mono<Void> shopCheck = Mono.empty();
                    if (productDTO.getShopId() != null) {
                        shopCheck = shopRepository.findById(productDTO.getShopId())
                                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND,
                                        "Shop not found with id " + productDTO.getShopId())))
                                .doOnNext(shop -> existing.setShopId(shop.getId()))
                                .then();
                    }
                    return Mono.when(catCheck, shopCheck)
                            .then(productR2DBCRepository.save(existing));
                })
                .flatMap(updated -> Mono.zip(
                        productImageRepository.findByProductId(updated.getId()).collectList(),
                        productVideoRepository.findByProductId(updated.getId()).collectList(),
                        variantRepository.findByProductId(updated.getId()).collectList()
                ).flatMap(tuple -> {
                    ProductDocument doc = productMapper.toDocument(updated, tuple.getT1(), tuple.getT2(), tuple.getT3());
                    return productElasticSearchRepository.save(doc)
                            .onErrorResume(e -> {
                                log.error("Sync to ES failed for product {}: {}", updated.getId(), e.getMessage());
                                return Mono.empty();
                            }).thenReturn(productMapper.toDto(updated, tuple.getT1(), tuple.getT2(), tuple.getT3()));
                }));
    }


    // --------------------- Misc ---------------------

    @Override
    public Mono<Void> recordSale(UUID productId, long qty) {
        return productR2DBCRepository.incrementSalesCount(productId, qty)
                .flatMap(updated -> {
                    if (updated != 1) {
                        return Mono.error(new ResponseStatusException(
                                HttpStatus.NOT_FOUND, "Product not found: " + productId));
                    }
                    // success -> complete with empty Mono
                    return Mono.empty();
                });
    }


    public Mono<Void> syncAllProductsToES() {
        return productR2DBCRepository.findAll()
                .flatMap(product -> Mono.zip(
                        productImageRepository.findByProductId(product.getId()).collectList(),
                        productVideoRepository.findByProductId(product.getId()).collectList(),
                        variantRepository.findByProductId(product.getId()).collectList(),
                        Mono.just(product)
                ))
                .map(tuple -> {
                    Product p = tuple.getT4();
                    List<ProductImage> imgs = tuple.getT1();
                    List<ProductVideo> vids = tuple.getT2();
                    List<ProductVariant> vars = tuple.getT3();
                    return productMapper.toDocument(p, imgs, vids, vars);
                })
                .collectList()
                .flatMapMany(productElasticSearchRepository::saveAll) // nếu saveAll trả Flux
                .then();
    }


    @Override
    public Flux<ProductVariantInfo> getProductVariantsInfo(List<UUID> variantIds) {
        return variantRepository.findAllByIdIn(variantIds)
                .flatMap(productVariantInfoMapper::toInfo);
    }


    @Override
    public Mono<Void> deductVariantStock(UUID variantId, int qty) {
        return variantRepository.decrementQuantity(variantId, qty)
                .flatMap(updated -> {
                    if (updated != 1) {
                        return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                "Không đủ tồn kho cho variant " + variantId));
                    }
                    return variantRepository.findById(variantId)
                            .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND,
                                    "Variant không tồn tại: " + variantId)))
                            .flatMap(v -> {
                                if (v.getQuantityOnHand() < LOW_STOCK_THRESHOLD) {
                                    return Mono.error(new ResponseStatusException(HttpStatus.BAD_REQUEST,
                                            "Cảnh báo: tồn kho của variant " + variantId +
                                                    " chỉ còn " + v.getQuantityOnHand() + " đơn vị."));
                                }
                                return Mono.empty();
                            });
                }).then();
    }


    private void enforceSinglePrimaryImage(List<ProductImage> images) {
        if (images == null || images.isEmpty()) return;

        // Count current primary flags
        long primaryCount = images.stream()
                .filter(img -> Boolean.TRUE.equals(img.getIsPrimary()))
                .count();

        if (primaryCount == 0) {
            // no primary -> set first as primary
            ProductImage first = images.get(0);
            first.setIsPrimary(true);
            return;
        }

        if (primaryCount > 1) {
            // keep the first found primary, unset the rest
            boolean kept = false;
            for (ProductImage img : images) {
                if (Boolean.TRUE.equals(img.getIsPrimary())) {
                    if (!kept) {
                        kept = true; // keep this one
                    } else {
                        img.setIsPrimary(false);
                    }
                }
            }
        }
    }

    /**
     * Normalize isPrimary flags inside ProductImageDTO list (used before mapping/saving).
     */
    private void normalizePrimaryInImageDTOs(List<ProductImageDTO> imageDtos) {
        if (imageDtos == null || imageDtos.isEmpty()) return;

        long primaryCount = imageDtos.stream()
                .filter(dto -> Boolean.TRUE.equals(dto.getIsPrimary()))
                .count();

        if (primaryCount == 0) {
            imageDtos.get(0).setIsPrimary(true);
            return;
        }

        if (primaryCount > 1) {
            boolean kept = false;
            for (ProductImageDTO dto : imageDtos) {
                if (Boolean.TRUE.equals(dto.getIsPrimary())) {
                    if (!kept) {
                        kept = true;
                    } else {
                        dto.setIsPrimary(false);
                    }
                }
            }
        }
    }

    /**
     * If you want to persist correction (only needed if you changed flags after saving),
     * you can call this to update DB so the persisted rows reflect single-primary rule.
     * Example usage:
     *   ensureOnePrimaryAfterSave(imgs).subscribe();
     *
     * It will update any images that changed isPrimary flag.
     */
    private reactor.core.publisher.Mono<Void> ensureOnePrimaryAfterSave(List<ProductImage> images) {
        if (images == null || images.isEmpty()) return reactor.core.publisher.Mono.empty();

        // Find images whose state (isPrimary) requires DB update.
        List<ProductImage> toUpdate = images.stream()
                .filter(img -> img.getId() != null) // only update persisted ones
                .collect(Collectors.toList());

        if (toUpdate.isEmpty()) return reactor.core.publisher.Mono.empty();

        return productImageRepository.findByProductId(toUpdate.get(0).getProductId()).collectList()
                .flatMap(existingList -> {
                    // build updated list from 'images' (passed param)
                    Map<UUID, ProductImage> newState = images.stream()
                            .filter(img -> img.getId() != null)
                            .collect(Collectors.toMap(ProductImage::getId, img -> img));

                    List<ProductImage> needSaving = existingList.stream()
                            .filter(dbImg -> {
                                ProductImage candidate = newState.get(dbImg.getId());
                                return candidate != null && !Objects.equals(Boolean.TRUE.equals(dbImg.getIsPrimary()), Boolean.TRUE.equals(candidate.getIsPrimary()));
                            })
                            .map(dbImg -> {
                                ProductImage candidate = newState.get(dbImg.getId());
                                dbImg.setIsPrimary(candidate.getIsPrimary());
                                return dbImg;
                            })
                            .collect(Collectors.toList());

                    if (needSaving.isEmpty()) return reactor.core.publisher.Mono.empty();

                    return productImageRepository.saveAll(needSaving).collectList().then();
                });
    }

}
