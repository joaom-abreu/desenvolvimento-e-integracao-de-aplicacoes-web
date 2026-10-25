# ==========================================================================
# ETAPA 1 - BUILD: Maven 3.9 + JDK 21 compila e gera o .jar
# ==========================================================================
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app

# Primeiro só o pom.xml: o Docker reaproveita o cache das dependências
# quando só o código muda.
COPY pom.xml .
RUN mvn -q -B dependency:go-offline

COPY src ./src
RUN mvn -q -B clean package -DskipTests

# ==========================================================================
# ETAPA 2 - EXECUÇÃO: só o Java 21 (JRE), imagem bem menor
# ==========================================================================
FROM eclipse-temurin:21-jre
WORKDIR /app

# não roda como root
RUN useradd --system --uid 1001 spring
USER spring

COPY --from=build /app/target/DronesDTI.jar app.jar

# O Render injeta a variável PORT; localmente vale 8080 (application.properties)
EXPOSE 8080

# MaxRAMPercentage: usa até 75% da memória do container (o plano grátis do Render tem 512 MB)
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
