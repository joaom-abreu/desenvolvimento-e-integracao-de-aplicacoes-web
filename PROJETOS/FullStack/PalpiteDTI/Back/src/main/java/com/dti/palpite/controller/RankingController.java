package com.dti.palpite.controller;

import com.dti.palpite.dto.RankingItemResponse;
import com.dti.palpite.service.RankingService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ranking")
public class RankingController {

    private final RankingService rankingService;

    public RankingController(RankingService rankingService) {
        this.rankingService = rankingService;
    }

    /** GET /api/ranking?limite=10 -> as melhores partidas vencidas (400 se o limite for inválido). */
    @GetMapping
    public List<RankingItemResponse> ranking(@RequestParam(required = false) Integer limite) {
        return rankingService.top(limite);
    }
}
