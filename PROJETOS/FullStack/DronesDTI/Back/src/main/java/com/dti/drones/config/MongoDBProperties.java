package com.dti.drones.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Lê do application.properties tudo que começa com "app.mongodb":
 *
 *   app.mongodb.connection-string=mongodb+srv://...
 *   app.mongodb.database=DronesDTI
 *
 * O Spring converte "connection-string" (kebab-case) para o atributo "connectionString".
 */
@ConfigurationProperties(prefix = "app.mongodb")
public class MongoDBProperties {

    private String connectionString = "mongodb://localhost:27017";
    private String database = "DronesDTI";

    public String getConnectionString() { return connectionString; }
    public void setConnectionString(String connectionString) { this.connectionString = connectionString; }
    public String getDatabase() { return database; }
    public void setDatabase(String database) { this.database = database; }
}
