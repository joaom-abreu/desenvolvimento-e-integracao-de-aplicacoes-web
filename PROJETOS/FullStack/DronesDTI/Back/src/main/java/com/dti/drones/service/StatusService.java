package com.dti.drones.service;

import com.dti.drones.dto.StatusResponse;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;

/** Diz se a API está de pé e se o MongoDB responde (comando "ping"). */
@Service
public class StatusService {

    private final MongoTemplate mongoTemplate;

    public StatusService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public StatusResponse verificar() {
        String mongodb;
        try {
            mongoTemplate.executeCommand("{ ping: 1 }");
            mongodb = "online";
        } catch (RuntimeException e) {
            mongodb = "offline";
        }
        return new StatusResponse("online", mongodb, "1.0.0", Instant.now());
    }
}
