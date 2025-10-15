package com.example.Order_Service.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.*;
import lombok.*;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerAddressDTO {
    @JsonProperty(access = JsonProperty.Access.READ_ONLY)
    private UUID id;

    @NotNull(message = "userId cannot be null")
    private UUID userId;

    @NotBlank(message = "receiverName cannot be blank")
    private String receiverName;

    @NotBlank(message = "phoneNumber cannot be blank")
    @Size(min = 7, max = 20)
    private String phoneNumber;

    @NotBlank(message = "detailAddress cannot be blank")
    private String detailAddress;

    @NotBlank(message = "ward cannot be blank")
    private String ward;

    @NotBlank(message = "district cannot be blank")
    private String district;

    @NotBlank(message = "province cannot be blank")
    private String province;

    private Boolean isDefault = false;
}

