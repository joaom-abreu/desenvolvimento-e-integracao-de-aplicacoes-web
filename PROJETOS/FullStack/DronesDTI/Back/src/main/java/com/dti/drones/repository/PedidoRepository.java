package com.dti.drones.repository;

import com.dti.drones.model.Pedido;
import com.dti.drones.model.StatusPedido;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Collection;
import java.util.List;

/**
 * O Spring Data gera a implementação a partir do NOME do método:
 * findByStatus -> { "status": ? }
 */
public interface PedidoRepository extends MongoRepository<Pedido, String> {

    List<Pedido> findByStatus(StatusPedido status);

    List<Pedido> findByStatusIn(Collection<StatusPedido> status);

    List<Pedido> findByViagemId(String viagemId);

    long countByStatus(StatusPedido status);
}
