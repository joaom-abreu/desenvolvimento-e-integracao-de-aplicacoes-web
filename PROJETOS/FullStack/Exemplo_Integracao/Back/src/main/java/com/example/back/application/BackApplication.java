package com.example.back.application;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

/**
 * Ponto de entrada da API.
 *
 * Como esta classe fica no pacote "application", avisamos ao Spring onde
 * procurar os outros componentes (scanBasePackages) e os repositórios do
 * MongoDB (@EnableMongoRepositories).
 */
@SpringBootApplication(scanBasePackages = {"com.example.back"})
@EnableMongoRepositories("com.example.back.repository")
public class BackApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackApplication.class, args);
	}
}
