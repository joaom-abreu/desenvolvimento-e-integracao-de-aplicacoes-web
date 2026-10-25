# DronesDTI · Back-end (Spring Boot 4 + MongoDB)

API REST do simulador. A documentação completa (algoritmos, endpoints, testes, deploy) está no [README principal](../README.md).

```bash
./mvnw spring-boot:run      # sobe em http://localhost:8080 (MongoDB em localhost:27017 ou MONGODB_URI)
./mvnw test                 # JUnit 5 + Mockito + MockMvc (cobertura em target/site/jacoco)
docker build -t dronesdti-api . && docker run -p 8080:8080 -e MONGODB_URI=... dronesdti-api
```

Requisições prontas: [`requests.http`](requests.http).
