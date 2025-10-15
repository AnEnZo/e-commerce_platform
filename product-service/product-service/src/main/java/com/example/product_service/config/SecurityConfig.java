package com.example.product_service.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.context.NoOpServerSecurityContextRepository;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import org.springframework.http.server.reactive.ServerHttpRequest;

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
        http
                .csrf(csrf -> csrf.disable())
                // vì mình set SecurityContext thủ công trong WebFilter
                .securityContextRepository(NoOpServerSecurityContextRepository.getInstance())
                .authorizeExchange(ex -> ex
                        .pathMatchers(
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/swagger-resources/**",
                                "/webjars/**",
                                "/swagger-ui.html"
                        ).permitAll()
                        .anyExchange().authenticated()
                );

        return http.build();
    }

    /**
     * WebFilter thực hiện:
     *  - cho qua swagger/docs
     *  - kiểm tra X-Gateway-Secret (nếu sai trả 401)
     *  - đọc X-User-Name / X-User-Roles và set Authentication vào Reactive SecurityContext
     */
    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public WebFilter gatewayAuthWebFilter() {
        return (exchange, chain) -> {
            ServerHttpRequest request = exchange.getRequest();
            String path = request.getURI().getPath();

            // allow swagger/docs
            if (path.startsWith("/swagger-ui") || path.startsWith("/v3/api-docs") || path.equals("/swagger-ui.html")) {
                return chain.filter(exchange);
            }

            String secret = request.getHeaders().getFirst("X-Gateway-Secret");
            if (secret == null || !expectedSecret.equals(secret)) {
                logger.warn("Invalid gateway secret: {}", secret);
                exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
                return exchange.getResponse().setComplete();
            }

            String username = request.getHeaders().getFirst("X-User-Name");
            String rolesHeader = request.getHeaders().getFirst("X-User-Roles");

            if (username != null && rolesHeader != null) {
                List<SimpleGrantedAuthority> authorities = Arrays.stream(
                                rolesHeader.replace("[", "")
                                        .replace("]", "")
                                        .replace("\"", "")
                                        .split(","))
                        .map(String::trim)
                        .map(r -> r.startsWith("ROLE_") ? r : "ROLE_" + r)
                        .map(SimpleGrantedAuthority::new)
                        .collect(Collectors.toList());

                Authentication auth = new UsernamePasswordAuthenticationToken(username, null, authorities);
                SecurityContextImpl ctx = new SecurityContextImpl(auth);

                // đẩy SecurityContext vào Reactor Context để Spring Security reactive có thể đọc
                return chain.filter(exchange)
                        .contextWrite(ReactiveSecurityContextHolder.withSecurityContext(Mono.just(ctx)));
            }

            // nếu không có username/roles thì chỉ tiếp tục (sẽ bị deny bởi rule .authenticated())
            return chain.filter(exchange);
        };
    }
}
