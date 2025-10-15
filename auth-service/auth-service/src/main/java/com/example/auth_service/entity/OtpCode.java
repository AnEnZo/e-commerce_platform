package com.example.auth_service.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.relational.core.mapping.Column;

import java.time.LocalDateTime;

@Table("otp_code")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpCode {

    @Id
    private Long id;

    @Column("phone_number")
    private String phoneNumber;

    @Column("code")
    private String code;

    @Column("created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public boolean isExpired() {
        // Hết hạn sau 5 phút
        return createdAt.plusMinutes(5).isBefore(LocalDateTime.now());
    }
}
