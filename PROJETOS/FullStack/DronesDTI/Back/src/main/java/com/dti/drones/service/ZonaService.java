package com.dti.drones.service;

import com.dti.drones.config.CidadeProperties;
import com.dti.drones.dto.ZonaRequest;
import com.dti.drones.dto.ZonaResponse;
import com.dti.drones.exception.RecursoNaoEncontradoException;
import com.dti.drones.exception.RegraNegocioException;
import com.dti.drones.model.Pedido;
import com.dti.drones.model.StatusPedido;
import com.dti.drones.model.ZonaExclusao;
import com.dti.drones.repository.PedidoRepository;
import com.dti.drones.repository.ZonaExclusaoRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/** Zonas de exclusão aérea (obstáculos). */
@Service
public class ZonaService {

    private final ZonaExclusaoRepository zonaRepository;
    private final PedidoRepository pedidoRepository;
    private final MapaService mapaService;
    private final CidadeProperties cidade;

    public ZonaService(ZonaExclusaoRepository zonaRepository, PedidoRepository pedidoRepository,
                       MapaService mapaService, CidadeProperties cidade) {
        this.zonaRepository = zonaRepository;
        this.pedidoRepository = pedidoRepository;
        this.mapaService = mapaService;
        this.cidade = cidade;
    }

    public List<ZonaResponse> listar() {
        return zonaRepository.findAll().stream().map(ZonaResponse::de).toList();
    }

    public ZonaResponse criar(ZonaRequest req) {
        ZonaExclusao zona = new ZonaExclusao(req.nome().trim(), req.xMin(), req.yMin(), req.xMax(), req.yMax());

        if (zona.getXMax() - zona.getXMin() < 0.1 || zona.getYMax() - zona.getYMin() < 0.1) {
            throw new RegraNegocioException("A zona precisa ter pelo menos 100 m de largura e de altura.");
        }
        if (!cidade.dentroDaCidade(zona.getXMin(), zona.getYMin()) || !cidade.dentroDaCidade(zona.getXMax(), zona.getYMax())) {
            throw new RegraNegocioException("A zona precisa ficar dentro dos limites da cidade.");
        }
        if (zona.contem(cidade.base())) {
            throw new RegraNegocioException("A zona não pode cobrir a base dos drones.");
        }
        List<Pedido> afetados = pedidoRepository.findByStatus(StatusPedido.PENDENTE).stream()
                .filter(p -> zona.contem(p.ponto()))
                .toList();
        if (!afetados.isEmpty()) {
            throw new RegraNegocioException("Existem " + afetados.size()
                    + " pedido(s) pendente(s) dentro dessa área. Cancele-os ou escolha outra área.");
        }

        ZonaExclusao salva = zonaRepository.save(zona);
        mapaService.invalidar();
        return ZonaResponse.de(salva);
    }

    public void remover(String id) {
        if (!zonaRepository.existsById(id)) {
            throw new RecursoNaoEncontradoException("Zona", id);
        }
        zonaRepository.deleteById(id);
        mapaService.invalidar();
    }
}
