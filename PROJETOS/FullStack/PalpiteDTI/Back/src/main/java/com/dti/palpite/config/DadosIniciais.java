package com.dti.palpite.config;

import com.dti.palpite.repository.PartidaRepository;
import com.dti.palpite.service.SimulacaoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/**
 * Na primeira subida (banco vazio), cria partidas de exemplo jogadas por robôs.
 * Assim o ranking e as estatísticas já abrem com dados na demonstração.
 * Desligue com app.jogo.popular-ao-iniciar=false.
 */
@Component
public class DadosIniciais implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DadosIniciais.class);

    private final JogoProperties props;
    private final PartidaRepository partidaRepository;
    private final SimulacaoService simulacaoService;

    public DadosIniciais(JogoProperties props, PartidaRepository partidaRepository, SimulacaoService simulacaoService) {
        this.props = props;
        this.partidaRepository = partidaRepository;
        this.simulacaoService = simulacaoService;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (!props.isPopularAoIniciar()) {
            return;
        }
        try {
            if (partidaRepository.count() == 0) {
                int criadas = simulacaoService.gerarPartidas(props.getPartidasIniciais()).criadas();
                log.info("Banco vazio: {} partidas de exemplo criadas.", criadas);
            }
        } catch (RuntimeException e) {
            // a API sobe mesmo sem banco; /api/status vai mostrar "mongodb": "offline"
            log.warn("Não foi possível criar os dados iniciais (MongoDB fora do ar?): {}", e.getMessage());
        }
    }
}
