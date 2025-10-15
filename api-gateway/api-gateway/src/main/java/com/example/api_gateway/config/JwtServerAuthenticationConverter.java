package com.example.api_gateway.config;

import org.springframework.http.HttpHeaders;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.server.authentication.ServerAuthenticationConverter;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class JwtServerAuthenticationConverter implements ServerAuthenticationConverter {
    private static final String TOKEN_COOKIE = "ACCESS-TOKEN";

    @Override
    public Mono<Authentication> convert(ServerWebExchange exchange) {
        ServerHttpRequest request = exchange.getRequest();

        // Lấy cookie ACCESS-TOKEN (chỉ ở đây)
        if (request.getCookies() != null) {
            var cookie = request.getCookies().getFirst(TOKEN_COOKIE);
            if (cookie != null) {
                String token = cookie.getValue();
                if (token != null && !token.isBlank()) {
                    // principal/credentials = token string; AuthManager sẽ validate
                    return Mono.just(new UsernamePasswordAuthenticationToken(token, token));
                }
            }
        }

        // Không tìm thấy token -> không authenticate
        return Mono.empty();
    }
}
