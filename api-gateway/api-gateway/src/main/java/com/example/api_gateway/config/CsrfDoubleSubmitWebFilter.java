package com.example.api_gateway.config;

import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.http.server.reactive.ServerHttpResponse;
import org.springframework.http.HttpCookie;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

@Component
public class CsrfDoubleSubmitWebFilter implements WebFilter {

    private static final String CSRF_COOKIE_NAME = "XSRF-TOKEN";
    private static final String CSRF_HEADER_NAME = "X-XSRF-TOKEN";

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();
        String path = request.getPath().value();

        // Skip CSRF for public auth endpoints (login/register/...).
        if (path.startsWith("/auth-service/api/auth") || path.startsWith("/api/auth") || path.startsWith("payment-service/api/payments/webhook")) {
            return chain.filter(exchange);
        }

        HttpMethod method = request.getMethod();
        if (method == null ||
                method == HttpMethod.GET ||
                method == HttpMethod.HEAD ||
                method == HttpMethod.OPTIONS ||
                method == HttpMethod.TRACE) {
            return chain.filter(exchange);
        }

        HttpCookie csrfCookie = request.getCookies().getFirst(CSRF_COOKIE_NAME);
        String csrfHeader = request.getHeaders().getFirst(CSRF_HEADER_NAME);

        if (csrfCookie == null || csrfHeader == null || !csrfHeader.equals(csrfCookie.getValue())) {
            ServerHttpResponse resp = exchange.getResponse();
            resp.setStatusCode(HttpStatus.FORBIDDEN);
            return resp.setComplete();
        }

        return chain.filter(exchange);
    }


}
