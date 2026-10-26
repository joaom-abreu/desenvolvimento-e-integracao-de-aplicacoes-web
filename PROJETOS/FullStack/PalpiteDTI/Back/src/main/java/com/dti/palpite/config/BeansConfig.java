package com.dti.palpite.config;

import com.dti.palpite.jogo.Arbitro;
import com.dti.palpite.jogo.Sorteador;
import com.dti.palpite.jogo.SorteadorAleatorio;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.security.SecureRandom;
import java.time.Clock;

/**
 * Objetos que não são @Service, mas que queremos injetar.
 *
 * - Clock: o relógio é injetado (e não "Instant.now()" espalhado no código)
 *   para os testes conseguirem controlar o tempo (duração da partida).
 * - Sorteador: interface (padrão Strategy). Em produção, SecureRandom; nos testes,
 *   um sorteador "viciado" que devolve sempre o número que o teste quer.
 * - Arbitro: as regras puras do jogo (pacote jogo) não dependem do Spring;
 *   é aqui que elas viram um bean.
 */
@Configuration
public class BeansConfig {

    @Bean
    public Clock clock() {
        return Clock.systemUTC();
    }

    @Bean
    public Sorteador sorteador() {
        // SecureRandom: não dá para prever o próximo número a partir dos anteriores
        return new SorteadorAleatorio(new SecureRandom());
    }

    @Bean
    public Arbitro arbitro() {
        return new Arbitro();
    }
}
