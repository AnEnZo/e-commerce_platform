package com.example.api_gateway.config;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.ExchangeFilterFunctions;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Component
public class AuthServiceReactiveAuthenticationManager implements ReactiveAuthenticationManager {

    private final WebClient webClient;

    @Value("${gateway.secret}")
    private String gatewaySecret;

    public AuthServiceReactiveAuthenticationManager(@LoadBalanced WebClient.Builder builder) {
        this.webClient = builder
                .baseUrl("lb://auth-service")
                // status -> status.isError() ; resp -> new BadCredentialsException(...)
                .filter(ExchangeFilterFunctions.statusError(
                        status -> status.isError(),
                        resp -> new BadCredentialsException("Invalid token")
                ))
                .build();
    }

    @Override
    public Mono<Authentication> authenticate(Authentication authentication) {
        String token = authentication.getCredentials().toString();

        return webClient.post()
                .uri("/api/auth/validate-token")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .retrieve()
                .bodyToMono(JsonNode.class)
                .flatMap(json -> {
                    boolean valid = json.path("valid").asBoolean(false);
                    if (!valid) {
                        return Mono.error(new BadCredentialsException("Token invalid"));
                    }
                    String username = json.path("username").asText();
                    // Parse roles array
                    List<String> roles = StreamSupport.stream(
                                    json.path("roles").spliterator(), false)
                            .map(JsonNode::asText)
                            .collect(Collectors.toList());

                    List<GrantedAuthority> auths = roles.stream()
                            .map(SimpleGrantedAuthority::new)
                            .collect(Collectors.toList());

                    // Tạo Authentication và lưu gatewaySecret vào details
                    var authToken = new UsernamePasswordAuthenticationToken(
                            username, null, auths);
                    authToken.setDetails(gatewaySecret);
                    return Mono.just(authToken);
                });
    }
}
