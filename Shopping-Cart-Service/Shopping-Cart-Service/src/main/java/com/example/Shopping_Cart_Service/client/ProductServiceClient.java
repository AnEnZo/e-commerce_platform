package com.example.Shopping_Cart_Service.client;

import com.example.Shopping_Cart_Service.dto.ProductVariantInfo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.ClientRequest;
import org.springframework.web.reactive.function.client.ExchangeFilterFunction;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class ProductServiceClient {
    private final WebClient webClient;

    public ProductServiceClient(WebClient.Builder builder, @Value("${gateway.secret}") String gatewaySecret) {
        this.webClient = builder
                .baseUrl("http://localhost:8082")
                .filter(addAuthHeadersFilter(gatewaySecret))
                .build();
    }

    private ExchangeFilterFunction addAuthHeadersFilter(String gatewaySecret) {
        return ExchangeFilterFunction.ofRequestProcessor(request ->
                // Lấy Authentication từ ReactiveSecurityContextHolder (nếu có)
                ReactiveSecurityContextHolder.getContext()
                        .map(ctx -> ctx.getAuthentication())
                        // Nếu có authentication -> build request mới với header
                        .flatMap(auth -> {
                            String username = auth.getName() != null ? auth.getName() : "";
                            String roles = auth.getAuthorities().stream()
                                    .map(GrantedAuthority::getAuthority)
                                    .collect(Collectors.joining(","));
                            ClientRequest newReq = ClientRequest.from(request)
                                    .header("X-Gateway-Secret", gatewaySecret)
                                    .header("X-User-Name", username)
                                    .header("X-User-Roles", roles)
                                    .build();
                            return Mono.just(newReq);
                        })
                        // Nếu ReactiveSecurityContextHolder rỗng -> trả lại request gốc (không null!)
                        .defaultIfEmpty(request)
        );
    }

    public Mono<List<ProductVariantInfo>> getVariantsInfo(List<UUID> variantIds) {
        return webClient.post()
                .uri("/api/menu-items/variants/batch")
                .bodyValue(variantIds)
                .retrieve()
                .bodyToFlux(ProductVariantInfo.class)
                .collectList();
    }
}
