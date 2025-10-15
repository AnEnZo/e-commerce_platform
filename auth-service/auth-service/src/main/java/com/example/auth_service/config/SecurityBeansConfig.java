package com.example.auth_service.config;



import com.example.auth_service.security.CustomReactiveUserDetailsService;
import com.example.auth_service.security.JwtTokenUtil;
import com.example.auth_service.security.oauth2.HttpCookieOAuth2AuthorizationRequestRepository;
import com.example.auth_service.security.oauth2.OAuth2AuthenticationSuccessHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.ReactiveAuthenticationManager;
import org.springframework.security.authentication.UserDetailsRepositoryReactiveAuthenticationManager;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class SecurityBeansConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public OAuth2AuthenticationSuccessHandler oauth2SuccessHandler(
            JwtTokenUtil jwtTokenUtil,
            HttpCookieOAuth2AuthorizationRequestRepository repo
    ) {
        return new OAuth2AuthenticationSuccessHandler(jwtTokenUtil, repo);
    }

    @Bean
    public ReactiveAuthenticationManager reactiveAuthenticationManager(CustomReactiveUserDetailsService customReactiveUserDetailsService, PasswordEncoder passwordEncoder) {
        return new UserDetailsRepositoryReactiveAuthenticationManager(customReactiveUserDetailsService) {{
            setPasswordEncoder(passwordEncoder);
        }};
    }


}

