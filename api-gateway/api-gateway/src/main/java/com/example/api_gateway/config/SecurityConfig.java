package com.example.api_gateway.config;


import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.AuthenticationWebFilter;
import org.springframework.security.web.server.context.NoOpServerSecurityContextRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;
import org.springframework.web.server.ServerWebExchange;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableWebFluxSecurity
@AllArgsConstructor
public class SecurityConfig {

    private final CsrfDoubleSubmitWebFilter csrfDoubleSubmitWebFilter;

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(
            ServerHttpSecurity http,
            AuthServiceReactiveAuthenticationManager authServiceReactiveAuthenticationManager,
            JwtServerAuthenticationConverter jwtServerAuthenticationConverter) {

        // Tạo filter
        AuthenticationWebFilter jwtFilter = new AuthenticationWebFilter(authServiceReactiveAuthenticationManager);
        jwtFilter.setServerAuthenticationConverter(jwtServerAuthenticationConverter);
        jwtFilter.setSecurityContextRepository(NoOpServerSecurityContextRepository.getInstance());

        // Khi auth thành công, thêm header và forward
        jwtFilter.setAuthenticationSuccessHandler((webFilterExchange, auth) -> {
            ServerWebExchange exchange = webFilterExchange.getExchange();
            String secret = auth.getDetails().toString();
            String username = auth.getName();
            String roles = auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .collect(Collectors.joining(","));
            ServerHttpRequest mutated = exchange.getRequest().mutate()
                    .header("X-Gateway-Secret", secret)
                    .header("X-User-Name", username)
                    .header("X-User-Roles", roles)
                    .build();
            return webFilterExchange.getChain()
                    .filter(exchange.mutate().request(mutated).build());
        });

        return http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeExchange(ex -> ex
                        .pathMatchers(
                                "/api/auth/**",
                                "/actuator/**",
                                "/auth-service/**",
                                "/oauth2/**",
                                "payment-service/api/payments/webhook/**",
                                "/product-service/**"
                        ).permitAll()
                        .anyExchange().authenticated()
                )
                .addFilterBefore(csrfDoubleSubmitWebFilter, SecurityWebFiltersOrder.AUTHENTICATION)
                .addFilterAt(jwtFilter, SecurityWebFiltersOrder.AUTHENTICATION)
                .securityContextRepository(NoOpServerSecurityContextRepository.getInstance())
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(List.of("http://localhost:5173","http://localhost:3000"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(List.of("*"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }



}
