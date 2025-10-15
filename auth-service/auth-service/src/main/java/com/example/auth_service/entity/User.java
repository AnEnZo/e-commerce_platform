package com.example.auth_service.entity;

import com.example.auth_service.ennum.AuthProvider;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import org.springframework.data.annotation.Transient;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Table("users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {


    @Id
    private UUID id;

    private String displayName;
    private String username;
    private String password;
    private String email;
    private String phoneNumber;
    private Integer rewardPoints;

    private AuthProvider provider;   // LOCAL, GOOGLE, FACEBOOK…

    private String providerId;       // lưu “sub” hoặc “id” của user bên provider

    @Transient
    @Builder.Default
    private Set<Long> roleIds = new HashSet<>();
}
