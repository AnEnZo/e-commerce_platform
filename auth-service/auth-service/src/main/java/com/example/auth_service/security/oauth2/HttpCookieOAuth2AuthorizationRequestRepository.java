package com.example.auth_service.security.oauth2;

import org.springframework.http.ResponseCookie;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import org.springframework.security.oauth2.client.web.server.ServerAuthorizationRequestRepository;
import java.io.*;
import java.time.Duration;
import java.util.Base64;
import java.util.Optional;

@Component
public class HttpCookieOAuth2AuthorizationRequestRepository
        implements ServerAuthorizationRequestRepository<OAuth2AuthorizationRequest> {

    public static final String OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME = "oauth2_auth_request";
    public static final String REDIRECT_URI_PARAM_COOKIE_NAME = "redirect_uri";
    private static final int COOKIE_EXPIRE_SECONDS = 180;

    @Override
    public Mono<OAuth2AuthorizationRequest> loadAuthorizationRequest(ServerWebExchange exchange) {
        return Mono.defer(() -> {
            Optional<String> maybeVal = Optional.ofNullable(exchange.getRequest().getCookies()
                            .getFirst(OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME))
                    .map(c -> c.getValue());
            if (maybeVal.isEmpty()) return Mono.empty();

            String encoded = maybeVal.get();
            // deserialize on boundedElastic to avoid blocking event-loop
            return Mono.fromCallable(() -> deserialize(encoded))
                    .subscribeOn(Schedulers.boundedElastic())
                    .flatMap(opt -> Mono.justOrEmpty(opt));
        });
    }

    @Override
    public Mono<Void> saveAuthorizationRequest(OAuth2AuthorizationRequest authorizationRequest, ServerWebExchange exchange) {
        if (authorizationRequest == null) {
            // remove cookies
            removeAuthorizationRequestCookies(exchange);
            return Mono.empty();
        }

        return Mono.fromCallable(() -> serialize(authorizationRequest))
                .subscribeOn(Schedulers.boundedElastic())
                .doOnNext(serialized -> {
                    ResponseCookie cookie = ResponseCookie.from(OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME, serialized)
                            .path("/")
                            .httpOnly(true)
                            .maxAge(Duration.ofSeconds(COOKIE_EXPIRE_SECONDS))
                            .build();
                    exchange.getResponse().addCookie(cookie);

                    String redirectUri = exchange.getRequest().getQueryParams().getFirst(REDIRECT_URI_PARAM_COOKIE_NAME);
                    if (redirectUri != null && !redirectUri.isBlank()) {
                        ResponseCookie rcookie = ResponseCookie.from(REDIRECT_URI_PARAM_COOKIE_NAME, redirectUri)
                                .path("/")
                                .httpOnly(true)
                                .maxAge(Duration.ofSeconds(COOKIE_EXPIRE_SECONDS))
                                .build();
                        exchange.getResponse().addCookie(rcookie);
                    }
                })
                .then();
    }

    @Override
    public Mono<OAuth2AuthorizationRequest> removeAuthorizationRequest(ServerWebExchange exchange) {
        return loadAuthorizationRequest(exchange)
                .doOnNext(req -> removeAuthorizationRequestCookies(exchange));
    }

    // Xoá cookies (set maxAge=0)
    private void removeAuthorizationRequestCookies(ServerWebExchange exchange) {
        ResponseCookie emptyAuth = ResponseCookie.from(OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME, "")
                .path("/")
                .httpOnly(true)
                .maxAge(Duration.ZERO)
                .build();
        exchange.getResponse().addCookie(emptyAuth);

        ResponseCookie emptyRedirect = ResponseCookie.from(REDIRECT_URI_PARAM_COOKIE_NAME, "")
                .path("/")
                .httpOnly(true)
                .maxAge(Duration.ZERO)
                .build();
        exchange.getResponse().addCookie(emptyRedirect);
    }

    // ---------- Serialization helpers (Java serialization + Base64) ----------
    private String serialize(OAuth2AuthorizationRequest obj) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (ObjectOutputStream oos = new ObjectOutputStream(baos)) {
            oos.writeObject(obj);
        }
        return Base64.getUrlEncoder().encodeToString(baos.toByteArray());
    }

    private Optional<OAuth2AuthorizationRequest> deserialize(String value) {
        try {
            byte[] bytes = Base64.getUrlDecoder().decode(value);
            try (ObjectInputStream ois = new ObjectInputStream(new ByteArrayInputStream(bytes))) {
                Object obj = ois.readObject();
                if (obj instanceof OAuth2AuthorizationRequest) {
                    return Optional.of((OAuth2AuthorizationRequest) obj);
                } else {
                    return Optional.empty();
                }
            }
        } catch (Exception ex) {
            return Optional.empty();
        }
    }
}
