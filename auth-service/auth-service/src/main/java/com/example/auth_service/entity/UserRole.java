package com.example.auth_service.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;

import java.util.UUID;

@Table("user_roles")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserRole {
    @Id
    private Long id;
    private UUID userId;
    private Long roleId;
}
