package com.example.Shopping_Cart_Service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.auditing.DateTimeProvider;
import org.springframework.data.r2dbc.config.EnableR2dbcAuditing;

import java.time.Instant;
import java.util.Optional;


@Configuration
@EnableR2dbcAuditing(dateTimeProviderRef = "dateTimeProvider")
public class R2dbcConfig {
    @Bean
    public DateTimeProvider dateTimeProvider() {
        return () -> Optional.of(Instant.now());
    }
}
