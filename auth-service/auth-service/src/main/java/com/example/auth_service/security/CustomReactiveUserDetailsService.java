package com.example.auth_service.security;

import com.example.auth_service.entity.User;
import com.example.auth_service.repository.RolesRepository;
import com.example.auth_service.repository.UserRepository;
import com.example.auth_service.repository.UserRoleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomReactiveUserDetailsService implements ReactiveUserDetailsService {

    private final UserRepository userRepository;
    private final UserRoleRepository userRoleRepository;
    private final RolesRepository rolesRepository;

    @Override
    public Mono<UserDetails> findByUsername(String username) {
        return userRepository.findByUsername(username)
                .switchIfEmpty(Mono.error(new UsernameNotFoundException(
                        "User not found with username: " + username
                )))
                .flatMap(user ->
                        userRoleRepository.findByUserId(user.getId())
                                .flatMap(userRole -> rolesRepository.findById(userRole.getRoleId()))
                                .map(role -> (GrantedAuthority) new SimpleGrantedAuthority(role.getName()))
                                .collect(Collectors.toSet())
                                .map(authorities -> CustomUserDetails.fromUser(user, authorities))
                );
    }
}
