package com.dti.palpite.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS: libera o navegador para chamar esta API a partir de outra origem.
 * O front roda em http://localhost:5173 (ou no Vercel) e a API em outra porta/domínio.
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

        registry.addMapping("/api/**")
                // allowedOriginPatterns aceita curingas, ex.: https://*.vercel.app
                .allowedOriginPatterns(origens)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                // deixa o navegador ler o cabeçalho Location das respostas 201 Created
                .exposedHeaders("Location");
    }
}
