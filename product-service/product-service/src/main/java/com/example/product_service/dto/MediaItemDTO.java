package com.example.product_service.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MediaItemDTO {
    private String url;            // secure_url từ Cloudinary
    private String publicId;       // public_id từ Cloudinary (nên lưu để xóa/replace sau này)
    private Integer position;     // ordering
    private String caption;
    private Boolean isPrimary;
}
