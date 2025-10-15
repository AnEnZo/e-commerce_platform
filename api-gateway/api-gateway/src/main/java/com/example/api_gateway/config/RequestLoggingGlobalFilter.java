package com.example.api_gateway.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class RequestLoggingGlobalFilter implements GlobalFilter, Ordered {
    private static final Logger log = LoggerFactory.getLogger(RequestLoggingGlobalFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        var request = exchange.getRequest();
        log.debug("[GATEWAY-IN] {} {} headers={}", request.getMethod(), request.getURI(), request.getHeaders());
        return chain.filter(exchange)
                .doOnSuccess(unused -> log.debug("[GATEWAY-OUT] {} {} -> status={}", request.getMethod(), request.getURI(), exchange.getResponse().getStatusCode()));
    }

    @Override
    public int getOrder() {
        return -1; // run early
    }
}
