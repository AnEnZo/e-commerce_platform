package com.example.Payment_Service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.domain.ReactiveAuditorAware;
import org.springframework.data.r2dbc.config.EnableR2dbcAuditing;
import reactor.core.publisher.Mono;

@Configuration
@EnableR2dbcAuditing
public class R2dbcConfig {

    // If you want to set createdBy/modifiedBy you can return current user; here we return empty
    @Bean
    public ReactiveAuditorAware<String> auditorAware() {
        return () -> Mono.empty();
    }
}
