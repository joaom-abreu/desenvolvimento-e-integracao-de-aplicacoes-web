package com.dti.palpite;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

/**
 * Ponto de entrada da API do jogo de adivinhação.
 *
 * - @ConfigurationPropertiesScan: encontra as classes *Properties do pacote config.
 * - @EnableMongoRepositories: cria a implementação das interfaces do pacote repository.
 */
@SpringBootApplication
@ConfigurationPropertiesScan
@EnableMongoRepositories("com.dti.palpite.repository")
public class PalpiteApplication {

    public static void main(String[] args) {
        SpringApplication.run(PalpiteApplication.class, args);
    }
}
