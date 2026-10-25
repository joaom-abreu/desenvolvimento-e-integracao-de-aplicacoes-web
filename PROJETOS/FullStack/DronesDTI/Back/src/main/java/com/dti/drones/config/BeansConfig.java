package com.dti.drones.config;

import com.dti.drones.algoritmo.CaixeiroViajante;
import com.dti.drones.algoritmo.PlanejadorViagens;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;

/**
 * Objetos que não são @Service, mas que queremos injetar.
 *
 * - Clock: o relógio é injetado (e não "Instant.now()" espalhado no código)
 *   para os testes conseguirem controlar o tempo.
 * - PlanejadorViagens: o algoritmo puro (pacote algoritmo) não depende do Spring;
 *   é aqui que ele vira um bean.
 */
@Configuration
public class BeansConfig {

    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }

    @Bean
    public PlanejadorViagens planejadorViagens(SimulacaoProperties props) {
        return new PlanejadorViagens(new CaixeiroViajante(props.getLimiteExato()), props.getMaxParadas());
    }
}
