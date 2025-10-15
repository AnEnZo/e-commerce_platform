package com.example.auth_service.mapper;

import com.example.auth_service.dto.UserDTO;
import com.example.auth_service.entity.User;

import java.util.HashSet;
import java.util.Set;

public class UserMapper {

    // Map cơ bản (không có role names)
    public static UserDTO toBasicDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .password(user.getPassword())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .displayName(user.getDisplayName())
                .rewardPoints(user.getRewardPoints())
                .roles(user.getRoleIds() != null ? new HashSet<>() : new HashSet<>()) // sẽ set sau khi load role names
                .provider(user.getProvider() != null ? user.getProvider().name() : null)
                .providerId(user.getProviderId())
                .build();
    }

    // Map đầy đủ với tên role (service sẽ cung cấp roleNames)
    public static UserDTO toDTO(User user, Set<String> roleNames) {
        UserDTO dto = toBasicDTO(user);
        dto.setRoles(roleNames != null ? roleNames : new HashSet<>());
        return dto;
    }

    // Chuyển DTO -> entity (chỉ map các trường cơ bản)
    public static User toEntity(UserDTO dto) {
        User user = User.builder()
                .id(dto.getId())
                .username(dto.getUsername())
                .password(dto.getPassword())
                .email(dto.getEmail())
                .phoneNumber(dto.getPhoneNumber())
                .displayName(dto.getDisplayName())
                .rewardPoints(dto.getRewardPoints())
                .build();

        if (dto.getRoles() != null) {
            user.setRoleIds(new HashSet<>()); // service chịu trách nhiệm resolve sang roleIds / user_roles
        }

        return user;
    }
}
