package com.dti.drones.service;

import com.dti.drones.config.SimulacaoProperties;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;

/**
 * Converte tempo REAL em tempo SIMULADO.
 *
 * Com fator 60, 1 segundo real = 1 minuto simulado: uma viagem de 20 minutos
 * simulados termina em 20 segundos na tela.
 *
 * Tudo é guardado como Instant real (timestamp). O "tempo simulado" é só uma
 * conta em cima da diferença entre dois timestamps.
 */
@Component
public class RelogioSimulacao {

    private final Clock clock;
    private final SimulacaoProperties props;

    public RelogioSimulacao(Clock clock, SimulacaoProperties props) {
        this.clock = clock;
        this.props = props;
    }

    public Instant agora() {
        return clock.instant();
    }

    public double fator() {
        return props.getFatorTempo();
    }

    /** Minutos simulados entre dois instantes reais. */
    public double minutosEntre(Instant de, Instant ate) {
        return Duration.between(de, ate).toMillis() * props.getFatorTempo() / 60_000.0;
    }

    /** Instante real em que terão passado "minutosSimulados" a partir de "inicio". */
    public Instant depoisDe(Instant inicio, double minutosSimulados) {
        return inicio.plusMillis(Math.round(minutosSimulados * 60_000.0 / props.getFatorTempo()));
    }
}
