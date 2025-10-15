package com.example.auth_service.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.security.core.userdetails.ReactiveUserDetailsService;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class JwtTokenUtil {

    @Value("${jwt.secret}")
    private String secret;

    // expiration in seconds
    @Value("${jwt.expiration:3600}")
    private Long expiration;

    // prefix key in redis for blacklist entries
    @Value("${jwt.blacklist.prefix:blacklist:jwt:}")
    private String blacklistPrefix;

    private final ReactiveUserDetailsService userDetailsService;
    private final ReactiveStringRedisTemplate redisTemplate;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(UserDetails userDetails) {
        CustomUserDetails u = (CustomUserDetails) userDetails;
        List<String> roles = u.getAuthorities().stream()
                .map(granted -> granted.getAuthority())
                .collect(Collectors.toList());

        long now = System.currentTimeMillis();
        long expMillis = now + (expiration * 1000L);

        return Jwts.builder()
                .setSubject(u.getUsername())
                .claim("userID",u.getId())
                .claim("displayName", u.getDisplayName())
                .claim("roles", roles)
                .setIssuedAt(new Date(now))
                .setExpiration(new Date(expMillis))
                .signWith(getSigningKey(), SignatureAlgorithm.HS512)
                .compact();
    }

    public UUID getUserIdFromToken(String token) {
        return getClaimFromToken(token, claims -> {
            Object idObj = claims.get("userID");
            if (idObj instanceof Integer) {
                return UUID.fromString(String.valueOf((Integer) idObj));
            } else if (idObj instanceof String) {
                return UUID.fromString((String) idObj);
            } else {
                throw new IllegalArgumentException("Invalid userID type in token");
            }
        });
    }
    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = getUsernameFromToken(token);
        return (username != null && username.equals(userDetails.getUsername()) && !isTokenExpired(token));
    }

    public String getUsernameFromToken(String token) {
        return getClaimFromToken(token, Claims::getSubject);
    }

    public Date getExpirationDateFromToken(String token) {
        return getClaimFromToken(token, Claims::getExpiration);
    }

    public <T> T getClaimFromToken(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = getAllClaimsFromToken(token);
        return claimsResolver.apply(claims);
    }

    private Claims getAllClaimsFromToken(String token) {
        // parse và ném exception nếu invalid/expired (caller có thể bắt)
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public Boolean isTokenExpired(String token) {
        final Date exp = getExpirationDateFromToken(token);
        return exp.before(new Date());
    }

    /**
     * Trả về tên user hiện tại dưới dạng Mono (reactive-friendly)
     */
    public Mono<String> getCurrentUsername() {
        return ReactiveSecurityContextHolder.getContext()
                .map(ctx -> {
                    Authentication a = ctx.getAuthentication();
                    if (a == null || !a.isAuthenticated()) {
                        throw new RuntimeException("No authenticated user");
                    }
                    return a.getName();
                });
    }

    /**
     * Trả về Authentication từ token theo kiểu reactive.
     */
    public Mono<Authentication> getAuthentication(String token) {
        String username = getUsernameFromToken(token);
        return userDetailsService.findByUsername(username)
                .map(userDetails -> new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities()
                ));
    }

    public String getJtiFromToken(String token) {
        return getClaimFromToken(token, claims -> {
            Object j = claims.get("jti");
            return j != null ? String.valueOf(j) : null;
        });
    }

    public Mono<Void> revokeToken(String token) {
        String jti;
        try {
            jti = getJtiFromToken(token);
            if (jti == null) {
                return Mono.empty();
            }
        } catch (ExpiredJwtException ex) {
            // token expired, không cần revoke
            return Mono.empty();
        } catch (Exception ex) {
            return Mono.error(ex);
        }

        Date exp = getExpirationDateFromToken(token);
        long ttlSeconds = Math.max(0, Duration.between(Instant.now(), exp.toInstant()).getSeconds());
        if (ttlSeconds <= 0) {
            return Mono.empty();
        }

        String key = blacklistPrefix + jti;
        // set value "1" với TTL
        return redisTemplate.opsForValue()
                .set(key, "1", Duration.ofSeconds(ttlSeconds))
                .then();
    }

    public Mono<Boolean> isTokenBlacklisted(String token) {
        String jti;
        try {
            jti = getJtiFromToken(token);
            if (jti == null) {
                return Mono.just(false);
            }
        } catch (ExpiredJwtException ex) {
            // expired token => treat as not-blacklisted (it is already invalid)
            return Mono.just(false);
        } catch (Exception ex) {
            return Mono.error(ex);
        }

        String key = blacklistPrefix + jti;
        return redisTemplate.hasKey(key)
                .onErrorReturn(false);
    }

}
