package com.dti.drones.service;

import com.dti.drones.algoritmo.MapaAereo;
import com.dti.drones.repository.ZonaExclusaoRepository;
import org.springframework.stereotype.Service;

/**
 * Mantém o MapaAereo (zonas de exclusão + cache de trajetos) em memória.
 * É reconstruído só quando uma zona é criada ou removida.
 */
@Service
public class MapaService {

    private final ZonaExclusaoRepository zonaRepository;
    private volatile MapaAereo cache;

    public MapaService(ZonaExclusaoRepository zonaRepository) {
        this.zonaRepository = zonaRepository;
    }

    public MapaAereo mapa() {
        MapaAereo atual = cache;
        if (atual == null) {
            atual = MapaAereo.de(zonaRepository.findAll());
            cache = atual;
        }
        return atual;
    }

    public void invalidar() {
        cache = null;
    }
}
