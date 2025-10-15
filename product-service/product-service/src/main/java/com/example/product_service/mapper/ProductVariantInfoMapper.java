package com.example.product_service.mapper;

import com.example.product_service.dto.ProductVariantInfo;
import com.example.product_service.entity.ProductVariant;
import com.example.product_service.repository.ProductImageRepository;
import com.example.product_service.repository.ProductR2DBCRepository;
import com.example.product_service.repository.ShopRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.List;
 

@Component
@AllArgsConstructor
public class ProductVariantInfoMapper {

    private final ShopRepository shopRepository;
    private final ProductR2DBCRepository productRepository;
    private final ProductImageRepository productImageRepository;

    public Mono<ProductVariantInfo> toInfo(ProductVariant v) {
        return productRepository.findById(v.getProductId())
                .flatMap(p ->
                        shopRepository.findById(p.getShopId())
                                .flatMap(shop ->
                                        productImageRepository.findByProductIdOrderByPositionAsc(p.getId())
                                                .collectList()
                                                .map(images -> {
                                                    ProductVariantInfo info = new ProductVariantInfo();
                                                    info.setVariantId(v.getId());
                                                    info.setShopId(p.getShopId());
                                                    info.setProductName(p.getName());
                                                    info.setColor(v.getColor());
                                                    info.setSize(v.getSize());

                                                    // lấy ảnh đầu tiên nếu có
                                                    String imageUrl = images.isEmpty() ? null : images.get(0).getUrl();
                                                    info.setImageUrl(imageUrl);

                                                    info.setShopName(shop.getName());
                                                    return info;
                                                })
                                )
                );
    }


    public Flux<ProductVariantInfo> toInfoList(List<ProductVariant> variants) {
        if (variants == null || variants.isEmpty()) {
            return Flux.empty();
        }

        return Flux.fromIterable(variants)
                .flatMap(this::toInfo); // toInfo trả về Mono nên flatMap sẽ unwrap
    }

}
