package com.dti.drones;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Ponto de entrada da API do simulador de entregas por drone.
 *
 * - @ConfigurationPropertiesScan: encontra as classes *Properties do pacote config.
 * - @EnableScheduling: liga o "relógio" da simulação (SimulacaoService.tick()).
 * - @EnableMongoRepositories: cria as implementações das interfaces do pacote repository.
 */
@SpringBootApplication
@ConfigurationPropertiesScan
@EnableScheduling
@EnableMongoRepositories("com.dti.drones.repository")
public class DronesApplication {

    public static void main(String[] args) {
        SpringApplication.run(DronesApplication.class, args);
    }
}
