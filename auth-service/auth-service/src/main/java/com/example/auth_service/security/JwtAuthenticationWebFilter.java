package com.example.auth_service.security;

import io.jsonwebtoken.ExpiredJwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.buffer.DataBuffer;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.context.SecurityContextImpl;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationWebFilter implements WebFilter {

    private final JwtTokenUtil jwtTokenUtil;
    private final ReactiveUserDetailsService userDetailsService;

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        String header = exchange.getRequest().getHeaders().getFirst("Authorization");
        if (header == null || !header.startsWith("Bearer ")) {
            // Không có token → tiếp tục (các endpoint public sẽ pass, private sẽ bị block bởi security)
            return chain.filter(exchange);
        }

        String token = header.substring(7);
        final ServerHttpResponse response = exchange.getResponse();

        String username;
        try {
            username = jwtTokenUtil.getUsernameFromToken(token);
        } catch (ExpiredJwtException e) {
            return writeUnauthorized(response, "Token has expired");
        } catch (Exception e) {
            return writeUnauthorized(response, "Invalid token");
        }

        // Tìm user reactive, validate token và set SecurityContext reactive
        return userDetailsService.findByUsername(username)
                .flatMap(userDetails -> {
                    if (jwtTokenUtil.validateToken(token, userDetails)) {
                        Authentication auth = new UsernamePasswordAuthenticationToken(
                                userDetails, null, userDetails.getAuthorities()
                        );
                        SecurityContextImpl secCtx = new SecurityContextImpl(auth);
                        // Đẩy security context vào Reactor context trước khi tiếp tục chuỗi lọc
                        return chain.filter(exchange)
                                .contextWrite(ReactiveSecurityContextHolder.withSecurityContext(Mono.just(secCtx)));
                    } else {
                        return writeUnauthorized(response, "Invalid token");
                    }
                })
                .switchIfEmpty(writeUnauthorized(response, "User not found"));
    }

    private Mono<Void> writeUnauthorized(ServerHttpResponse response, String message) {
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        response.getHeaders().setContentType(MediaType.TEXT_PLAIN);
        byte[] bytes = message.getBytes(StandardCharsets.UTF_8);
        DataBuffer buffer = response.bufferFactory().wrap(bytes);
        return response.writeWith(Mono.just(buffer));
    }
}
