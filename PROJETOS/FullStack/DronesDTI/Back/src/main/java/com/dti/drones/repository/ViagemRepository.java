package com.dti.drones.repository;

import com.dti.drones.model.StatusViagem;
import com.dti.drones.model.Viagem;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ViagemRepository extends MongoRepository<Viagem, String> {

    List<Viagem> findByStatus(StatusViagem status);

    /** As 50 últimas viagens concluídas (mais recentes primeiro). */
    List<Viagem> findTop50ByStatusOrderByFimDesc(StatusViagem status);
}
