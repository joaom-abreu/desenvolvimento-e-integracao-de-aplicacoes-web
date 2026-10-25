package com.dti.drones.repository;

import com.dti.drones.model.Drone;
import com.dti.drones.model.EstadoDrone;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface DroneRepository extends MongoRepository<Drone, String> {

    List<Drone> findByEstado(EstadoDrone estado);

    boolean existsByNomeIgnoreCase(String nome);
}
