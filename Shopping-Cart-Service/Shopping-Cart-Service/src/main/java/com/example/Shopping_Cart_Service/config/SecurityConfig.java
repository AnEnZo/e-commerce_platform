package com.example.Shopping_Cart_Service.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
@EnableReactiveMethodSecurity
public class SecurityConfig {

    private static final Logger logger = LoggerFactory.getLogger(SecurityConfig.class);

    @Value("${gateway.secret}")
    private String expectedSecret;

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {

        WebFilter headerAuthFilter = (ServerWebExchange exchange, WebFilterChain chain) -> {
            String path = exchange.getRequest().getURI().getPath();

            // Cho qua tài nguyên swagger/docs
            if (path.startsWith("/swagger-ui") || path.startsWith("/v3/api-docs") || path.equals("/swagger-ui.html")) {
                return chain.filter(exchange);
            }

            String secret = exchange.getRequest().getHeaders().getFirst("X-Gateway-Secret");
            if (secret == null || !expectedSecret.equals(secret)) {
                logger.warn("Invalid gateway secret: {}", secret);
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            String username = exchange.getRequest().getHeaders().getFirst("X-User-Name");
            String rolesHeader = exchange.getRequest().getHeaders().getFirst("X-User-Roles");

            if (username != null && rolesHeader != null) {
                List<SimpleGrantedAuthority> authorities = Arrays.stream(
                                rolesHeader.replace("[", "")
                                        .replace("]", "")
                                        .replace("\"", "")
                                        .split(","))
                        .map(String::trim)
                        .filter(s -> !s.isEmpty())
                        .map(role -> role.startsWith("ROLE_") ? role : "ROLE_" + role)
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());

                Authentication auth = new UsernamePasswordAuthenticationToken(username, null, authorities);
                SecurityContext context = new SecurityContextImpl(auth);

                // Đặt SecurityContext vào Reactor context để Spring Security reactive nhận diện.
                return chain.filter(exchange)
                        .contextWrite(ReactiveSecurityContextHolder.withSecurityContext(Mono.just(context)));
            }

            // Nếu không có header user -> tiếp tục (sẽ bị chặn bởi rules nếu cần authentication)
            return chain.filter(exchange);
        };

        return http
                .csrf(csrf -> csrf.disable())
                .authorizeExchange(exchanges -> exchanges
                        .pathMatchers(
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/swagger-resources/**",
                                "/webjars/**",
                                "/swagger-ui.html"
                        ).permitAll()
                        .anyExchange().authenticated()
                )
                // đặt filter ở vị trí AUTHENTICATION (tương đương addFilterBefore so với servlet stack)
                .addFilterAt(headerAuthFilter, SecurityWebFiltersOrder.AUTHENTICATION)
                .build();
    }
}
