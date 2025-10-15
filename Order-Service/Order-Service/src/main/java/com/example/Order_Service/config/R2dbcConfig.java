package com.example.Order_Service.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.r2dbc.config.EnableR2dbcAuditing;
import org.springframework.transaction.reactive.TransactionalOperator;

@Configuration
@EnableR2dbcAuditing
public class R2dbcConfig {
    @Bean
    public TransactionalOperator transactionalOperator(io.r2dbc.spi.ConnectionFactory connectionFactory) {
        org.springframework.r2dbc.connection.R2dbcTransactionManager txManager =
                new org.springframework.r2dbc.connection.R2dbcTransactionManager(connectionFactory);
        return TransactionalOperator.create(txManager);
    }
}

