package com.example.product_service.document;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.elasticsearch.annotations.*;
import java.util.List;
import java.util.Set;

@Data
@Document(indexName = "products")
@JsonIgnoreProperties(ignoreUnknown = true)
public class ProductDocument {

    @Id
    private String id;

    @MultiField(
            mainField = @Field(type = FieldType.Text, analyzer = "standard"),
            otherFields = {
                    @InnerField(suffix = "keyword", type = FieldType.Keyword)
            }
    )
    private String name;

    @Field(type = FieldType.Text)
    private String description;

    @Field(type = FieldType.Keyword)
    private List<String> imageUrls; // Flatten từ ProductImage.url

    @Field(type = FieldType.Keyword)
    private List<String> videoUrls; // Flatten từ ProductVideo.url

    @Field(type = FieldType.Keyword)
    private String status;

    @Field(type = FieldType.Long)
    private Long salesCount;

    @Field(type = FieldType.Double)
    private Double weight;

    @Field(type = FieldType.Double)
    private Double length;

    @Field(type = FieldType.Double)
    private Double width;

    @Field(type = FieldType.Double)
    private Double height;

    @Field(type = FieldType.Double)
    private Double averageRating;

    @Field(type = FieldType.Integer)
    private Integer reviewCount;

    @Field(type = FieldType.Keyword)
    private String slug;

    @Field(type = FieldType.Text)
    private String metaTitle;

    @Field(type = FieldType.Text)
    private String metaDescription;

    // Thông tin danh mục
    @Field(type = FieldType.Keyword)
    private String categoryId;

    @MultiField(
            mainField = @Field(type = FieldType.Text, analyzer = "standard"),
            otherFields = {
                    @InnerField(suffix = "keyword", type = FieldType.Keyword)
            }
    )
    private String categoryName;

    // Thông tin shop
    @Field(type = FieldType.Keyword)
    private String shopId;

    @Field(type = FieldType.Text)
    private String shopName;

    // Flatten danh sách variants
    @Field(type = FieldType.Nested)
    private Set<ProductVariantDocument> variants;

}


