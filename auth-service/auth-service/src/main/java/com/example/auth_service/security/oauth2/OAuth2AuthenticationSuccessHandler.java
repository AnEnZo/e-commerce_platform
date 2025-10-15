package com.example.auth_service.security.oauth2;

import com.example.auth_service.security.CustomUserDetails;
import com.example.auth_service.security.JwtTokenUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.server.WebFilterExchange;
import org.springframework.security.web.server.authentication.ServerAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.time.Duration;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler implements ServerAuthenticationSuccessHandler {

    private final JwtTokenUtil jwtTokenUtil;
    private final HttpCookieOAuth2AuthorizationRequestRepository authRequestRepo;

    @Override
    public Mono<Void> onAuthenticationSuccess(WebFilterExchange webFilterExchange, Authentication authentication) {
        // Lấy principal
        Object principalObj = authentication.getPrincipal();
        if (!(principalObj instanceof CustomUserDetails)) {
            // Nếu không phải kiểu mong muốn, bạn có thể support OAuth2User tuỳ nhu cầu
        }
        CustomUserDetails principal = (CustomUserDetails) principalObj;

        String token = jwtTokenUtil.generateToken(principal);

        // Lấy redirectUri từ cookie hoặc query param
        var exchange = webFilterExchange.getExchange();
        String redirectUri = Optional.ofNullable(exchange.getRequest().getCookies()
                        .getFirst(HttpCookieOAuth2AuthorizationRequestRepository.REDIRECT_URI_PARAM_COOKIE_NAME))
                .map(c -> c.getValue())
                .orElse(exchange.getRequest().getQueryParams().getFirst(HttpCookieOAuth2AuthorizationRequestRepository.REDIRECT_URI_PARAM_COOKIE_NAME));

        if (redirectUri == null || redirectUri.isBlank()) {
            redirectUri = "http://localhost:3000/oauth2-redirect";
        }

        // Set HttpOnly cookie with JWT for frontend to validate via /api/auth/validate-token
        ResponseCookie accessTokenCookie = ResponseCookie.from("ACCESS-TOKEN", token)
                .path("/")
                .httpOnly(true)
                .secure(false)
                .maxAge(Duration.ofDays(1))
                .sameSite("Lax")
                .build();
        exchange.getResponse().addCookie(accessTokenCookie);

        // Redirect without token in URL
        String targetUrl = UriComponentsBuilder.fromUriString(redirectUri)
                .build()
                .toUriString();

        // Xóa cookie state
        authRequestRepo.removeAuthorizationRequest(exchange).subscribe(); // thực hiện xoá cookie (non-blocking)

        // Ngoài ra đảm bảo cookie bị xóa nếu remove ko làm được (defensive)
        ResponseCookie emptyAuth = ResponseCookie.from(HttpCookieOAuth2AuthorizationRequestRepository.OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME, "")
                .path("/")
                .httpOnly(true)
                .maxAge(Duration.ZERO)
                .build();
        ResponseCookie emptyRedirect = ResponseCookie.from(HttpCookieOAuth2AuthorizationRequestRepository.REDIRECT_URI_PARAM_COOKIE_NAME, "")
                .path("/")
                .httpOnly(true)
                .maxAge(Duration.ZERO)
                .build();

        exchange.getResponse().addCookie(emptyAuth);
        exchange.getResponse().addCookie(emptyRedirect);

        // Redirect (HTTP 302)
        exchange.getResponse().setStatusCode(HttpStatus.FOUND);
        exchange.getResponse().getHeaders().setLocation(URI.create(targetUrl));
        return exchange.getResponse().setComplete();
    }
}
