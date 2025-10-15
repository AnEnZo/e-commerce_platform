package com.example.auth_service.security.oauth2;

import com.example.auth_service.entity.Roles;
import com.example.auth_service.entity.User;
import com.example.auth_service.ennum.AuthProvider;
import com.example.auth_service.repository.RolesRepository;
import com.example.auth_service.repository.UserRepository;
import com.example.auth_service.repository.UserRoleRepository;
import com.example.auth_service.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.userinfo.DefaultReactiveOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.ReactiveOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomReactiveOAuth2UserService
        implements ReactiveOAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final DefaultReactiveOAuth2UserService delegate = new DefaultReactiveOAuth2UserService();
    private final UserRepository userRepository;
    private final UserRoleRepository userRolesRepository;
    private final RolesRepository rolesRepository;

    @Override
    public Mono<OAuth2User> loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        return delegate.loadUser(userRequest)
                .flatMap(oauth2User -> {
                    String email = extractEmail(oauth2User.getAttributes());
                    if (email == null) {
                        return Mono.error(new OAuth2AuthenticationException("Email not found from OAuth2 provider"));
                    }

                    String registrationId = Optional.ofNullable(userRequest.getClientRegistration())
                            .map(r -> r.getRegistrationId())
                            .orElse("local");
                    String providerId = extractProviderId(oauth2User.getAttributes());

                    return userRepository.findByEmail(email)
                            .switchIfEmpty(createUserFromOAuth2(oauth2User, email, registrationId, providerId))
                            .flatMap(user ->
                                    userRolesRepository.findByUserId(user.getId()) // Flux<UserRole>
                                            .flatMap(userRole ->
                                                    rolesRepository.findById(userRole.getRoleId()) // Mono<Roles>
                                                            .map(role -> new SimpleGrantedAuthority(role.getName()))
                                            )
                                            .collectList()
                                            .map(authorities -> {
                                                Set<GrantedAuthority> authSet = new HashSet<>(authorities);
                                                if (authSet.isEmpty()) {
                                                    authSet.add(new SimpleGrantedAuthority("ROLE_USER"));
                                                }
                                                return CustomUserDetails.fromOAuth2User(
                                                        user,
                                                        authSet,
                                                        oauth2User.getAttributes()
                                                );
                                            })
                            );
                });
    }


    // Helper: tạo user mới từ oauth2User (chỉnh fields tùy User model của bạn)
    private Mono<User> createUserFromOAuth2(OAuth2User oauth2User, String email, String provider, String providerId) {
        User newUser = new User();
        newUser.setEmail(email);
        // lấy tên hiển thị nếu provider có
        Object nameAttr = oauth2User.getAttribute("name");
        newUser.setDisplayName(nameAttr != null ? nameAttr.toString() : email);
        // username tạm: phần trước @
        newUser.setUsername(email.contains("@") ? email.substring(0, email.indexOf("@")) : email);
        // Nếu User có password not null, bạn có thể để null hoặc 1 giá trị random
        newUser.setPassword(UUID.randomUUID().toString());

        // set provider & providerId
        try {
            AuthProvider authProvider = AuthProvider.valueOf(Optional.ofNullable(provider).orElse("LOCAL").toUpperCase());
            newUser.setProvider(authProvider);
        } catch (IllegalArgumentException ex) {
            newUser.setProvider(AuthProvider.LOCAL);
        }
        newUser.setProviderId(providerId);

        // Lưu reactive
        return userRepository.save(newUser);
    }

    // Helper: trích email từ attributes - mở rộng cho nhiều provider
    private String extractEmail(Map<String, Object> attrs) {
        if (attrs == null) return null;
        Object email = attrs.get("email");
        if (email != null) return email.toString();

        // một vài provider trả về "emails" hay "emailAddress"
        Object emails = attrs.get("emails");
        if (emails instanceof Iterable) {
            Iterator<?> it = ((Iterable<?>) emails).iterator();
            if (it.hasNext()) return it.next().toString();
        }
        Object emailAddress = attrs.get("emailAddress");
        if (emailAddress != null) return emailAddress.toString();

        // fallback: dùng sub/id nếu bạn chấp nhận dùng đó như identifier
        Object sub = attrs.get("sub");
        if (sub != null) return sub.toString();

        return null;
    }

    // Helper: lấy providerId từ attributes theo provider phổ biến
    private String extractProviderId(Map<String, Object> attrs) {
        if (attrs == null) return null;
        // Google uses "sub"
        Object sub = attrs.get("sub");
        if (sub != null) return sub.toString();
        // Facebook/GitHub often use "id"
        Object id = attrs.get("id");
        if (id != null) return id.toString();
        // Microsoft uses oid sometimes
        Object oid = attrs.get("oid");
        if (oid != null) return oid.toString();
        return null;
    }

    // Helper: lấy tên role từ object Roles (thay đổi tùy class Roles của bạn)
    private String getRoleName(Roles r) {
        try {
            // nếu Roles là entity với getName()
            return Objects.toString(r.getName(), "ROLE_USER");
        } catch (NoSuchMethodError | NoClassDefFoundError ex) {
            // fallback: nếu Roles là enum
            return r.getName();
        } catch (Exception ex) {
            // fallback an toàn
            return "ROLE_USER";
        }
    }
}
