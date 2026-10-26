package com.dti.palpite.controller;

import com.dti.palpite.config.JogoProperties;
import com.dti.palpite.dto.ConfiguracaoResponse;
import com.dti.palpite.dto.StatusResponse;
import com.dti.palpite.jogo.Desempenho;
import com.dti.palpite.service.StatusService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
public class StatusController {

    private final StatusService statusService;
    private final JogoProperties props;

    public StatusController(StatusService statusService, JogoProperties props) {
        this.statusService = statusService;
        this.props = props;
    }

    /** GET /api/status: { "api": "online", "mongodb": "online" } */
    @GetMapping("/api/status")
    public StatusResponse status() {
        return statusService.verificar();
    }

    /** GET /api/configuracao: limites do jogo para o front desenhar o tabuleiro. */
    @GetMapping("/api/configuracao")
    public ConfiguracaoResponse configuracao() {
        return new ConfiguracaoResponse(props.getMinimo(), props.getMaximo(),
                Desempenho.tentativasIdeais(props.intervaloInicial()), props.getTamanhoRanking());
    }

    /** GET / : página inicial da API, só para não dar 404 ao abrir no navegador. */
    @GetMapping("/")
    public Map<String, String> raiz() {
        Map<String, String> links = new LinkedHashMap<>();
        links.put("projeto", "PalpiteDTI - jogo de adivinhação (teste dti Rackers)");
        links.put("status", "/api/status");
        links.put("configuracao", "/api/configuracao");
        links.put("ranking", "/api/ranking");
        links.put("estatisticas", "/api/estatisticas");
        return links;
    }
}
