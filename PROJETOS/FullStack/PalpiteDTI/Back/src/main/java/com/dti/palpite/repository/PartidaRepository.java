package com.dti.palpite.repository;

import com.dti.palpite.model.Partida;
import com.dti.palpite.model.StatusPartida;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.Instant;
import java.util.List;

/**
 * Acesso à coleção "partidas". O Spring Data lê o NOME do método e gera a consulta:
 * findByStatus(VENCIDA, pagina) -> db.partidas.find({ status: "VENCIDA" }).sort(...).limit(...)
 */
public interface PartidaRepository extends MongoRepository<Partida, String> {

    List<Partida> findByStatus(StatusPartida status, Pageable pagina);

    long countByStatus(StatusPartida status);

    // as três contagens abaixo calculam a posição de uma partida no ranking sem carregar o ranking inteiro
    long countByStatusAndTentativasLessThan(StatusPartida status, int tentativas);

    long countByStatusAndTentativasAndDuracaoSegundosLessThan(StatusPartida status, int tentativas, Long duracaoSegundos);

    long countByStatusAndTentativasAndDuracaoSegundosAndFinalizadaEmLessThan(
            StatusPartida status, int tentativas, Long duracaoSegundos, Instant finalizadaEm);
}
