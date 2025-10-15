package com.example.auth_service.config;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpMediaTypeNotAcceptableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.NoSuchElementException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private Map<String, Object> buildErrorBody(HttpStatus status, String message, String path, String exception) {
        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        body.put("path", path);
        body.put("exception", exception);
        return body;
    }

    @ExceptionHandler(Exception.class)
    public Mono<ResponseEntity<Map<String, Object>>> handleAllExceptions(Exception ex, ServerWebExchange exchange) {
        ex.printStackTrace(); // log lỗi server-side

        Map<String, Object> body = buildErrorBody(
                HttpStatus.INTERNAL_SERVER_ERROR,
                ex.getMessage(),
                exchange.getRequest().getPath().value(),
                ex.getClass().getName()
        );

        return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(body));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public Mono<ResponseEntity<Map<String, Object>>> handleIllegalArgument(
            IllegalArgumentException ex, ServerWebExchange exchange) {

        Map<String, Object> body = buildErrorBody(
                HttpStatus.BAD_REQUEST,
                ex.getMessage(),
                exchange.getRequest().getPath().value(),
                ex.getClass().getName()
        );

        return Mono.just(ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body));
    }


    @ExceptionHandler(NoSuchElementException.class)
    public Mono<ResponseEntity<Map<String, Object>>> handleNotFound(NoSuchElementException ex, ServerWebExchange exchange) {
        Map<String, Object> body = buildErrorBody(
                HttpStatus.NOT_FOUND,
                "Không tìm thấy: " + ex.getMessage(),
                exchange.getRequest().getPath().value(),
                ex.getClass().getName()
        );

        return Mono.just(ResponseEntity.status(HttpStatus.NOT_FOUND).body(body));
    }
}
