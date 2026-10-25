package com.dti.drones.config;

import com.dti.drones.service.SimulacaoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Ao subir a API, se o banco estiver vazio, cria a frota e as zonas de exemplo.
 * Se o MongoDB não responder, só avisa no log (a API continua de pé).
 */
@Component
public class DadosIniciais implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DadosIniciais.class);

    private final SimulacaoService simulacaoService;
    private final SimulacaoProperties props;

    public DadosIniciais(SimulacaoService simulacaoService, SimulacaoProperties props) {
        this.simulacaoService = simulacaoService;
        this.props = props;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!props.isPopularAoIniciar()) {
            return;
        }
        try {
            simulacaoService.popularSeVazio();
        } catch (RuntimeException e) {
            log.warn("Não foi possível popular o banco ao iniciar ({}). Confira a conexão com o MongoDB.", e.getMessage());
        }
    }
}
