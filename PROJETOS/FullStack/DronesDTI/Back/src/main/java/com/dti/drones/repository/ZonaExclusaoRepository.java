package com.dti.drones.repository;

import com.dti.drones.model.ZonaExclusao;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ZonaExclusaoRepository extends MongoRepository<ZonaExclusao, String> {
}
