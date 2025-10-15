package com.example.auth_service.security;

import com.example.auth_service.entity.Roles;
import com.example.auth_service.entity.User;
import lombok.AllArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.*;
import java.util.stream.Collectors;

@AllArgsConstructor
public class CustomUserDetails implements UserDetails, OAuth2User {

    private final User user;
    private final Set<GrantedAuthority> authorities;
    private Map<String, Object> attributes;


    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }


    // Factory cho username/password
    public static CustomUserDetails fromUser(User user, Set<GrantedAuthority> authorities) {
        return new CustomUserDetails(user, authorities, null);
    }

    // Factory cho OAuth2, có thêm attributes
    public static CustomUserDetails fromOAuth2User(User user, Set<GrantedAuthority> authorities, Map<String, Object> attrs) {
        return new CustomUserDetails(user, authorities, attrs);
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public String getName() {
        if (attributes != null) {
            Object sub = attributes.get("sub");
            if (sub != null) return sub.toString();
            Object id = attributes.get("id");
            if (id != null) return id.toString();
        }
        return user.getId() != null ? user.getId().toString() : user.getUsername();
    }

    public String getDisplayName() {
        return user.getDisplayName();
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

    public UUID getId() {
        return user.getId();
    }
}
