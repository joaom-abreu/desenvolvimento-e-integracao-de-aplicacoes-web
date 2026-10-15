package com.example.back.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS: libera o navegador para chamar esta API a partir de outra origem.
 *
 * O front roda em http://localhost:5173 e a API em http://localhost:8080.
 * Porta diferente = origem diferente, então sem esta classe o navegador
 * bloqueia as requisições do React (erro de CORS no console).
 *
 * As origens permitidas vêm de CorsProperties (app.cors.allowed-origins).
 */
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    private final CorsProperties corsProperties;

    public CorsConfig(CorsProperties corsProperties) {
        this.corsProperties = corsProperties;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] origens = corsProperties.getAllowedOrigins().stream()
                .map(String::trim)
                .filter(origem -> !origem.isEmpty())
                .toArray(String[]::new);

        registry.addMapping("/**")
                // allowedOriginPatterns aceita endereços exatos e também curingas,
                // por exemplo https://*.vercel.app
                .allowedOriginPatterns(origens)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
