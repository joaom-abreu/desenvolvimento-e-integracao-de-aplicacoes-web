package com.dti.palpite.config;

import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;

import java.util.Collection;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Conecta o Spring Boot ao MongoDB (local ou Atlas) usando o MongoDBProperties.
 *
 * Estender AbstractMongoClientConfiguration faz o Spring criar o MongoClient e o
 * MongoTemplate a partir daqui.
 */
@Configuration
public class MongoConfig extends AbstractMongoClientConfiguration {

    private final MongoDBProperties properties;

    public MongoConfig(MongoDBProperties properties) {
        this.properties = properties;
    }

    @Override
    protected String getDatabaseName() {
        return properties.getDatabase();
    }

    @Override
    protected void configureClientSettings(MongoClientSettings.Builder builder) {
        String uri = properties.getConnectionString();
        if (uri == null || uri.isBlank()) {
            throw new IllegalStateException(
                    "Configure app.mongodb.connection-string (ou a variável de ambiente MONGODB_URI).");
        }
        ConnectionString connectionString;
        try {
            connectionString = new ConnectionString(uri);
        } catch (RuntimeException e) {
            throw new IllegalStateException(
                    "Connection string do MongoDB inválida. Confira usuário, senha e endereço do cluster.", e);
        }
        builder.applyConnectionString(connectionString)
                // se o banco não responder em 5 s, desiste (o padrão do driver é 30 s)
                .applyToClusterSettings(cluster -> cluster.serverSelectionTimeout(5, TimeUnit.SECONDS));
    }

    @Override
    protected Collection<String> getMappingBasePackages() {
        return List.of("com.dti.palpite.model");
    }

    /** Cria os índices declarados com @CompoundIndex (deixa o ranking rápido). */
    @Override
    protected boolean autoIndexCreation() {
        return true;
    }
}
