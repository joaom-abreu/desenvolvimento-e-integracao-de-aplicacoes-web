package com.dti.drones.service;

import com.dti.drones.config.CidadeProperties;
import com.dti.drones.dto.DroneRequest;
import com.dti.drones.dto.DroneResponse;
import com.dti.drones.dto.Numeros;
import com.dti.drones.exception.RecursoNaoEncontradoException;
import com.dti.drones.exception.RegraNegocioException;
import com.dti.drones.model.Drone;
import com.dti.drones.model.EstadoDrone;
import com.dti.drones.model.Parada;
import com.dti.drones.model.StatusViagem;
import com.dti.drones.model.Viagem;
import com.dti.drones.repository.DroneRepository;
import com.dti.drones.repository.ViagemRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/** Cadastro da frota e status em tempo real de cada drone. */
@Service
public class DroneService {

    private final DroneRepository droneRepository;
    private final ViagemRepository viagemRepository;
    private final RelogioSimulacao relogio;
    private final CidadeProperties cidade;

    public DroneService(DroneRepository droneRepository, ViagemRepository viagemRepository,
                        RelogioSimulacao relogio, CidadeProperties cidade) {
        this.droneRepository = droneRepository;
        this.viagemRepository = viagemRepository;
        this.relogio = relogio;
        this.cidade = cidade;
    }

    /** Status de todos os drones, incluindo carga e progresso da viagem atual. */
    public List<DroneResponse> status() {
        Map<String, Viagem> viagens = viagemRepository.findByStatus(StatusViagem.EM_ANDAMENTO).stream()
                .collect(Collectors.toMap(Viagem::getId, Function.identity(), (a, b) -> a));
        return droneRepository.findAll().stream()
                .sorted(Comparator.comparing(Drone::getNome, String.CASE_INSENSITIVE_ORDER))
                .map(d -> paraResposta(d, d.getViagemAtualId() == null ? null : viagens.get(d.getViagemAtualId())))
                .toList();
    }

    public DroneResponse criar(DroneRequest req) {
        String nome = req.nome().trim();
        if (droneRepository.existsByNomeIgnoreCase(nome)) {
            throw new RegraNegocioException("Já existe um drone chamado \"" + nome + "\".");
        }
        double velocidade = req.velocidadeKmh() == null ? 60 : req.velocidadeKmh();
        Drone drone = new Drone(nome, req.capacidadeKg(), req.alcanceKm(), velocidade, cidade.base());
        return paraResposta(droneRepository.save(drone), null);
    }

    public void remover(String id) {
        Drone drone = droneRepository.findById(id).orElseThrow(() -> new RecursoNaoEncontradoException("Drone", id));
        if (drone.getEstado() != EstadoDrone.IDLE && drone.getEstado() != EstadoDrone.RECARREGANDO) {
            throw new RegraNegocioException("O drone " + drone.getNome()
                    + " está em uma viagem. Espere ele voltar para a base para remover.");
        }
        droneRepository.delete(drone);
    }

    DroneResponse paraResposta(Drone d, Viagem viagem) {
        double carga = 0;
        int pacotes = 0;
        double progresso = 0;
        String proxima = null;
        if (viagem != null) {
            double t = relogio.minutosEntre(viagem.getInicio(), relogio.agora());
            progresso = Math.min(100, Math.max(0, t / viagem.getDuracaoMin() * 100));
            for (Parada p : viagem.getParadas()) {
                if (p.minutoEntrega() > t) {
                    carga += p.pesoKg();
                    pacotes++;
                    if (proxima == null) {
                        proxima = p.cliente();
                    }
                }
            }
        }
        double eficiencia = d.getDistanciaTotalKm() > 0 ? d.getEntregasRealizadas() / d.getDistanciaTotalKm() : 0;
        return new DroneResponse(d.getId(), d.getNome(), d.getCapacidadeKg(), d.getAlcanceKm(), d.getVelocidadeKmh(),
                Numeros.r1(d.getBateria()), d.getEstado().name(), d.getEstado().getRotulo(),
                Numeros.r2(d.getX()), Numeros.r2(d.getY()), d.getViagemAtualId(), Numeros.r2(carga), pacotes,
                Numeros.r1(progresso), proxima, d.getEntregasRealizadas(), d.getViagensRealizadas(),
                Numeros.r2(d.getDistanciaTotalKm()), Numeros.r2(d.getPesoTotalEntregueKg()),
                Numeros.r1(d.getTempoVooTotalMin()), Numeros.r2(eficiencia));
    }
}
