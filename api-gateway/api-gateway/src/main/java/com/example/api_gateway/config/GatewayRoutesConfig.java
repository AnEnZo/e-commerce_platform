package com.example.api_gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayRoutesConfig {

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                // Forward OAuth2 authorization and callback endpoints to auth-service
                .route("oauth2-to-auth-service", r -> r
                        .path("/oauth2/**", "/login/oauth2/**")
                        .uri("lb://auth-service"))
                .build();
    }
}


