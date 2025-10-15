package com.example.auth_service.entity;



import lombok.*;
import java.time.LocalDateTime;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.MappedCollection;

import java.time.LocalDateTime;
import java.util.UUID;

@Table("email_otp")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailOtp {

    @Id
    private Long id;

    @Column("otp")
    private String otp;

    @Column("user_id")
    private UUID userId; // Chỉ lưu userId, WebFlux/R2DBC không support @OneToOne như JPA

    @Column("expiry_date")
    private LocalDateTime expiryDate;
}

