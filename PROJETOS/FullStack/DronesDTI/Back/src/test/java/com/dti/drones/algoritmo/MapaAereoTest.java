package com.dti.drones.algoritmo;

import com.dti.drones.model.Ponto;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@DisplayName("Mapa aéreo (zonas de exclusão)")
class MapaAereoTest {

    private final MapaAereo mapa = new MapaAereo(List.of(new MapaAereo.Retangulo("Aeroporto", 4, -1, 6, 1)));

    @Test
    @DisplayName("sem obstáculos, a distância é a linha reta")
    void semObstaculos() {
        assertEquals(5, MapaAereo.semObstaculos().distancia(new Ponto(0, 0), new Ponto(3, 4)), 1e-9);
    }

    @Test
    @DisplayName("uma zona no meio do caminho força um desvio")
    void desvio() {
        Ponto a = new Ponto(0, 0);
        Ponto b = new Ponto(10, 0);
        MapaAereo.Trajeto trajeto = mapa.trajeto(a, b);

        assertTrue(trajeto.distancia() > 10, "o desvio precisa ser maior que a linha reta");
        assertTrue(trajeto.distancia() < 10.5, "mas não muito maior");
        for (int i = 1; i < trajeto.pontos().size(); i++) {
            assertTrue(mapa.visivel(trajeto.pontos().get(i - 1), trajeto.pontos().get(i)),
                    "nenhum trecho pode atravessar a zona");
        }
    }

    @Test
    @DisplayName("ponto dentro da zona é bloqueado")
    void bloqueado() {
        assertTrue(mapa.bloqueado(new Ponto(5, 0)));
        assertEquals("Aeroporto", mapa.zonaQueContem(new Ponto(5, 0)));
        assertFalse(mapa.bloqueado(new Ponto(7, 0)));
    }

    @Test
    @DisplayName("voar rente à borda não conta como atravessar")
    void borda() {
        assertTrue(mapa.visivel(new Ponto(0, 1), new Ponto(10, 1)));
        assertFalse(mapa.visivel(new Ponto(0, 0.5), new Ponto(10, 0.5)));
    }
}
