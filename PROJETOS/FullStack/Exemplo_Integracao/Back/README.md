# Projeto Back (Spring Boot + MongoDB Atlas) 🍃

![Java](https://img.shields.io/badge/Java-17-007ec6?style=for-the-badge&logo=openjdk&logoColor=white) ![Maven](https://img.shields.io/badge/Maven-3.9.11-007ec6?style=for-the-badge&logo=apachemaven&logoColor=white) ![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1.1-007ec6?style=for-the-badge&logo=springboot&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-007ec6?style=for-the-badge&logo=mongodb&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-007ec6?style=for-the-badge&logo=docker&logoColor=white)

## 📖 Descrição

API REST feita com **Spring Boot** que grava um CRUD simples de **alunos** no **MongoDB Atlas** (banco na nuvem).

Ela é a metade de trás de um par de projetos:

| Projeto | O que é | Porta local |
| --- | --- | --- |
| **Back** (este) | API Spring Boot + MongoDB Atlas | `http://localhost:8080` |
| [**Front**](../Front) | Tela em React + Vite que consome esta API | `http://localhost:5173` |

Até agora você fez projetos Spring Boot (que rodam sozinhos na porta 8080) e projetos React (que rodam sozinhos na porta 5173). Aqui os dois **rodam ao mesmo tempo e conversam entre si**: o React manda requisições HTTP para o Spring Boot, e o Spring Boot lê e grava no MongoDB.

```mermaid
flowchart LR
    A["🖥️ Navegador<br/>React + Vite<br/>localhost:5173"] -- "HTTP + JSON<br/>GET, POST, PUT, DELETE" --> B["☕ Spring Boot<br/>esta API<br/>localhost:8080"]
    B -- "connection string" --> C[("🍃 MongoDB Atlas<br/>nuvem")]
```

---

## 📦 Pacotes e responsabilidades

```text
com.example.back
├── application   → classe main (sobe a aplicação)
├── config        → lê o application.properties e configura MongoDB e CORS
├── controller    → recebe as requisições HTTP do front-end
├── service       → regras de negócio e validações
├── model         → classe Aluno (documento do MongoDB)
├── repository    → acesso ao MongoDB (MongoRepository)
└── exception     → exceções próprias + tratamento global de erros
```

**Caminho de uma requisição:**

```text
React → Controller → Service → Repository → MongoDB Atlas
                        │
                        └─ se algo der errado → Exception → GlobalExceptionHandler → JSON de erro para o React
```

### 📁 application

| Classe | Responsabilidade |
| --- | --- |
| `BackApplication` | Método `main`. Como fica no pacote `application`, usa `scanBasePackages` e `@EnableMongoRepositories` para o Spring achar os outros pacotes. |

### ⚙️ config

Todas as configurações ficam **escritas diretamente no `application.properties`** (sem variáveis de ambiente). As classes deste pacote leem esses valores e os entregam para o resto do projeto.

| Classe | Responsabilidade |
| --- | --- |
| `MongoDBProperties` | Lê `app.mongodb.connection-string` e `app.mongodb.database` |
| `CorsProperties` | Lê `app.cors.allowed-origins` |
| `MongoConfig` | Usa o `MongoDBProperties` para conectar ao MongoDB Atlas |
| `CorsConfig` | Usa o `CorsProperties` para liberar o front-end (veja [CORS](#-cors-por-que-o-front-precisa-de-permissão)) |

Como o valor sai do arquivo e chega ao código:

```text
application.properties                          config/MongoDBProperties.java
─────────────────────────────────────           ─────────────────────────────────────
app.mongodb.connection-string=mongodb+srv://... → private String connectionString;
app.mongodb.database=exemplo_integracao         → private String database;
        ▲                                                    │
        │ @ConfigurationProperties(prefix = "app.mongodb")   │ injetado no construtor
        │                                                    ▼
        └────────────────────────────────────── config/MongoConfig.java → MongoClient
```

### 🎮 controller

| Classe | Responsabilidade |
| --- | --- |
| `AlunoController` | CRUD em `/api/alunos` |
| `StatusController` | `GET /api/status`: diz se a API está no ar e se o MongoDB responde (usado pelo painel do front) |

### 🧠 service

| Classe | Responsabilidade |
| --- | --- |
| `AlunoService` | Valida os dados (nome e e-mail obrigatórios, e-mail válido) e chama o repository |
| `StatusService` | Manda um `ping` para o MongoDB para saber se ele está acessível |

### 🧩 model

| Classe | Responsabilidade |
| --- | --- |
| `Aluno` | `@Document(collection = "alunos")` com `id`, `nome`, `email` e `curso` |

### 🗄️ repository

| Classe | Responsabilidade |
| --- | --- |
| `AlunoRepository` | `MongoRepository<Aluno, String>`: já traz `findAll`, `findById`, `save`, `deleteById`. Tem também `findByNomeContainingIgnoreCaseOrderByNomeAsc` para a busca por nome. |

### 🚨 exception

| Classe | Responsabilidade |
| --- | --- |
| `AlunoNaoEncontradoException` | id inexistente → **404** |
| `DadosInvalidosException` | campo inválido → **400** |
| `ErroResposta` | Formato do JSON de erro |
| `GlobalExceptionHandler` | `@RestControllerAdvice` que transforma cada exceção no código HTTP certo |

Todo erro chega ao front-end neste formato. O React lê o campo `mensagem` e mostra na tela:

```json
{
  "status": 400,
  "erro": "Bad Request",
  "mensagem": "O nome do aluno é obrigatório.",
  "caminho": "/api/alunos",
  "timestamp": "2026-10-15T10:30:00.123"
}
```

| Situação | Código |
| --- | --- |
| Aluno não existe | 404 |
| Nome/e-mail vazio ou e-mail inválido | 400 |
| JSON mal formado | 400 |
| Endpoint inexistente | 404 |
| Método HTTP errado | 405 |
| MongoDB Atlas inacessível | 503 |
| Qualquer outro erro | 500 |

---

## 📂 Estrutura do Projeto

```text
📁 Back
│
├── 📁 .mvn/wrapper
│   └── maven-wrapper.properties  (versão do Maven usada pelo mvnw)
│
├── 📁 src/main
│   ├── 📁 java/com/example/back
│   │   ├── 🚀 application
│   │   │   └── BackApplication.java
│   │   │       └── Classe main (sobe a aplicação)
│   │   │
│   │   ├── ⚙️ config
│   │   │   ├── MongoDBProperties.java  └── Lê app.mongodb.*
│   │   │   ├── CorsProperties.java     └── Lê app.cors.*
│   │   │   ├── MongoConfig.java        └── Conecta ao MongoDB Atlas
│   │   │   └── CorsConfig.java         └── Libera o front-end (CORS)
│   │   │
│   │   ├── 🎮 controller
│   │   │   ├── AlunoController.java    └── CRUD em /api/alunos
│   │   │   └── StatusController.java   └── GET /api/status
│   │   │
│   │   ├── 🧠 service
│   │   │   ├── AlunoService.java       └── Validações + regras de negócio
│   │   │   └── StatusService.java      └── Ping no MongoDB
│   │   │
│   │   ├── 🧩 model
│   │   │   └── Aluno.java              └── Documento da coleção "alunos"
│   │   │
│   │   ├── 🗄️ repository
│   │   │   └── AlunoRepository.java    └── MongoRepository<Aluno, String>
│   │   │
│   │   └── 🚨 exception
│   │       ├── AlunoNaoEncontradoException.java  └── 404
│   │       ├── DadosInvalidosException.java      └── 400
│   │       ├── ErroResposta.java                 └── Formato do JSON de erro
│   │       └── GlobalExceptionHandler.java       └── Exceção → código HTTP
│   │
│   └── 📁 resources
│       └── application.properties
│           └── Porta, connection string do MongoDB e origens do CORS
│
├── 📄 Dockerfile
│   └── Build em duas etapas, usado no deploy do Render
├── 📄 .dockerignore
├── 📄 mvnw / mvnw.cmd
│   └── Maven Wrapper (macOS-Linux / Windows)
└── 📄 pom.xml
    └── Dependências: Spring Web MVC e Spring Data MongoDB
```

---

## 🌐 Endpoints

| Método | Endpoint | O que faz | Resposta |
| --- | --- | --- | --- |
| GET | `/api/status` | Status da API e do MongoDB | 200 |
| GET | `/api/alunos` | Lista todos os alunos | 200 |
| GET | `/api/alunos?nome=ana` | Busca alunos com "ana" no nome | 200 |
| GET | `/api/alunos/{id}` | Busca um aluno | 200 / 404 |
| POST | `/api/alunos` | Cadastra um aluno | 201 / 400 |
| PUT | `/api/alunos/{id}` | Atualiza um aluno | 200 / 400 / 404 |
| DELETE | `/api/alunos/{id}` | Exclui um aluno | 204 / 404 |

Corpo do POST e do PUT:

```json
{
  "nome": "Maria Souza",
  "email": "maria@sga.pucminas.br",
  "curso": "Engenharia de Software"
}
```

Testando sem o front-end (terminal, Postman ou Insomnia):

```bash
# Status
curl http://localhost:8080/api/status

# Cadastrar
curl -X POST http://localhost:8080/api/alunos \
  -H "Content-Type: application/json" \
  -d '{"nome":"Maria Souza","email":"maria@sga.pucminas.br","curso":"Engenharia de Software"}'

# Listar
curl http://localhost:8080/api/alunos
```

---

## 🍃 Configurando o MongoDB Atlas

O Render (onde vamos hospedar a API) oferece banco **PostgreSQL**, não MongoDB. Por isso usamos o **MongoDB Atlas**, que é o MongoDB na nuvem com plano gratuito. A API se conecta a ele por uma **connection string**, tanto no seu computador quanto no Render.

### 1. Criar o cluster

1. Crie uma conta em [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas/register).
2. Crie um cluster **Free (M0)**. Escolha a região mais próxima (ex.: São Paulo).

### 2. Criar o usuário do banco

Em **Security > Database Access > Add New Database User**:

- Método: **Password**
- Usuário e senha: anote os dois (dica: use uma senha só com letras e números, para evitar problemas na connection string)
- Permissão: **Read and write to any database**

### 3. Liberar o acesso pela rede

Em **Security > Network Access > Add IP Address**, clique em **Allow Access from Anywhere** (`0.0.0.0/0`).

> O plano gratuito do Render não tem IP fixo, então o Atlas precisa aceitar conexões de qualquer IP. Sem isso, a API funciona no seu computador mas não no Render.

### 4. Copiar a connection string

Em **Database > Connect > Drivers**, escolha **Java** e copie a string. Ela tem este formato:

```text
mongodb+srv://USUARIO:<db_password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

Troque `<db_password>` pela senha do usuário (sem os sinais `< >`).

> ⚠️ Se a senha tiver caracteres especiais, eles precisam ser codificados: `@` → `%40`, `:` → `%3A`, `/` → `%2F`, `?` → `%3F`, `#` → `%23`, `%` → `%25`.

### 5. Colar no `application.properties`

```properties
app.mongodb.connection-string=mongodb+srv://joao:minhasenha123@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
app.mongodb.database=exemplo_integracao
```

Não precisa criar o banco nem a coleção no Atlas: o MongoDB cria o banco `exemplo_integracao` e a coleção `alunos` no primeiro cadastro. Para ver os dados, abra **Database > Browse Collections**.

> ⚠️ **Cuidado ao subir para o GitHub:** como a senha fica escrita no `application.properties`, quem vir o repositório vê a senha. Use um **repositório privado**, ou um usuário do Atlas criado só para este exemplo (que você pode apagar depois).

---

## 📄 `application.properties` completo

```properties
spring.application.name=Back

# Porta da API (o front chama http://localhost:8080)
server.port=8080

# MongoDB Atlas (lido por config/MongoDBProperties.java)
app.mongodb.connection-string=mongodb+srv://SEU_USUARIO:SUA_SENHA@seucluster.xxxxx.mongodb.net/?retryWrites=true&w=majority&appName=SeuCluster
app.mongodb.database=exemplo_integracao

# CORS (lido por config/CorsProperties.java)
app.cors.allowed-origins=http://localhost:5173,https://exemplo-integracao-front.vercel.app
```

---

## 🔓 CORS: por que o front precisa de permissão?

O navegador considera que duas URLs têm a **mesma origem** só quando **protocolo, domínio e porta** são iguais:

| Front-end | Back-end | Mesma origem? |
| --- | --- | --- |
| `http://localhost:5173` | `http://localhost:8080` | ❌ porta diferente |
| `https://meu-front.vercel.app` | `https://minha-api.onrender.com` | ❌ domínio diferente |

Por segurança, quando um JavaScript de uma origem chama uma API de **outra** origem, o navegador só entrega a resposta se a API disser: "essa origem pode me chamar". Essa autorização se chama **CORS** (*Cross-Origin Resource Sharing*). Sem ela, o React recebe um erro assim no console (F12):

```text
Access to fetch at 'http://localhost:8080/api/alunos' from origin 'http://localhost:5173'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present...
```

Pontos importantes:

- **Quem bloqueia é o navegador**, não o Spring Boot. Por isso a mesma URL funciona no Postman, no `curl` ou abrindo direto na barra de endereço, mas falha quando é chamada pelo React.
- **A permissão é dada pelo back-end.** O front-end não consegue "se liberar" sozinho.
- Nos projetos Spring Boot anteriores, as páginas (Thymeleaf/HTML) vinham do **próprio** Spring Boot, na mesma porta 8080. Então tudo era mesma origem e o CORS nunca apareceu. Agora, com front e back separados, ele passa a ser obrigatório.

Neste projeto, quem dá a permissão é o `CorsConfig`, usando a lista do `application.properties`:

```properties
app.cors.allowed-origins=http://localhost:5173,https://exemplo-integracao-front.vercel.app
```

- `http://localhost:5173` → o front rodando no seu computador
- `https://...vercel.app` → o front publicado no Vercel (troque pela **sua** URL depois do deploy)

> Escreva as origens **sem barra no final** (`https://app.vercel.app`, e não `https://app.vercel.app/`). Também é possível usar curinga, como `https://*.vercel.app`, para aceitar as URLs de preview do Vercel.

---

## 🚀 Como rodar

### Pré-requisitos

- **JDK 17** instalado. Confira com `java -version`.
- MongoDB Atlas configurado (seção acima).
- Maven **não** precisa estar instalado: o projeto tem o **Maven Wrapper** (`mvnw` / `mvnw.cmd`), que baixa o Maven 3.9.11 sozinho na primeira execução.

### Só o back-end

```bash
# macOS / Linux
./mvnw spring-boot:run

# Windows (cmd ou PowerShell)
.\mvnw.cmd spring-boot:run
```

Ou abra o projeto no IntelliJ e rode a classe `BackApplication`.

Depois abra [http://localhost:8080/api/status](http://localhost:8080/api/status). Se tudo estiver certo:

```json
{ "api": "online", "mongodb": "online" }
```

Se aparecer `"mongodb": "offline"`, a API está funcionando, mas não alcançou o Atlas: confira a connection string e o Network Access.

### Back-end + front-end juntos (um terminal só) ⭐

Os dois projetos precisam ficar **lado a lado na mesma pasta**:

```text
📁 Exemplo_Integracao
├── 📁 Back    ← este projeto (porta 8080)
└── 📁 Front   ← projeto React (porta 5173)
```

Dentro do **front-end**, rode:

```bash
cd Front
npm install            # só na primeira vez

npm run dev:all        # macOS / Linux
npm run dev:all:windows   # Windows
```

O pacote [`concurrently`](https://www.npmjs.com/package/concurrently) roda os dois comandos ao mesmo tempo no mesmo terminal: `./mvnw spring-boot:run` aqui e `vite` no front. O passo a passo completo está no [README do front-end](../Front/README.md#-rodando-os-dois-projetos-ao-mesmo-tempo).

---

## 🐳 Docker

O Render não tem uma opção nativa para Java. A forma mais simples de publicar um Spring Boot nele é com **Docker**: o Render lê o `Dockerfile`, monta uma imagem e roda o container.

### Dockerfile

```dockerfile
# ETAPA 1 - BUILD
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q -B dependency:go-offline
COPY src ./src
RUN mvn -q -B clean package -DskipTests

# ETAPA 2 - EXECUÇÃO
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "app.jar"]
```

#### 🔍 O que cada parte faz

O arquivo tem **duas etapas** (*multi-stage build*):

**Etapa 1: compilar**

- **`FROM maven:3.9-eclipse-temurin-17 AS build`**: imagem com Maven e JDK 17, usada só para gerar o `.jar`.
- **`COPY pom.xml .` + `RUN mvn dependency:go-offline`**: baixa as dependências antes de copiar o código. Se só o código mudar, o Docker reaproveita esse passo (cache) e o build fica mais rápido.
- **`COPY src ./src` + `RUN mvn clean package -DskipTests`**: compila e gera `target/Back-0.0.1-SNAPSHOT.jar`.

**Etapa 2: executar**

- **`FROM eclipse-temurin:17-jre`**: imagem bem menor, só com o Java necessário para **rodar** (sem Maven e sem compilador).
- **`COPY --from=build ... app.jar`**: traz apenas o `.jar` da etapa 1.
- **`EXPOSE 8080`**: informa a porta da aplicação (a mesma do `server.port`).
- **`ENTRYPOINT [...]`**: comando que inicia o Spring Boot. O `-XX:MaxRAMPercentage=75` limita o Java a 75% da memória do container, porque o plano gratuito do Render tem só 512 MB.

> Usamos o Maven da própria imagem (`mvn`) em vez do `./mvnw`. Assim o build não quebra quando o `mvnw` perde a permissão de execução ou fica com quebras de linha do Windows (CRLF).

### Testando o Docker no seu computador (opcional)

Precisa do [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e aberto.

```bash
docker build -t exemplo-integracao-back .
docker run -p 8080:8080 exemplo-integracao-back
```

Acesse [http://localhost:8080/api/status](http://localhost:8080/api/status).

---

## ☁️ Deploy no Render

### Passo a passo

1. Suba o projeto para o GitHub.
2. No [Render](https://render.com/), clique em **New > Web Service** e conecte o repositório.
3. Preencha:

| Campo | Valor |
| --- | --- |
| **Name** | `exemplo-integracao-back` (vira parte da URL) |
| **Language / Runtime** | `Docker` |
| **Branch** | `main` |
| **Root Directory** | vazio se o repositório tiver só este projeto. Se o repositório tiver o front e o back juntos, coloque `Back` |
| **Instance Type** | `Free` |

4. Em **Environment**, adicione `PORT` = `8080`. O código **não** lê essa variável: ela só avisa ao Render que o container usa a porta 8080. Sem ela, o Render tenta descobrir a porta sozinho, o que costuma funcionar, mas ela evita surpresas.
5. Clique em **Deploy Web Service** e acompanhe os **Logs**. O primeiro build leva alguns minutos.
6. Quando terminar, o Render mostra a URL da API, por exemplo:

```text
https://exemplo-integracao-back.onrender.com
```

Abra `https://exemplo-integracao-back.onrender.com/api/status` no navegador e confira se aparece `"mongodb": "online"`.

> 💤 **Plano gratuito:** o Render "dorme" a API depois de 15 minutos sem acesso. A primeira requisição depois disso leva **até 1 minuto** para responder, enquanto o container acorda. É normal.

### Toda alteração = novo deploy

O Render faz deploy automático a cada `git push` na branch configurada. Como as configurações estão no `application.properties`, para trocar a connection string ou as origens do CORS basta editar o arquivo, fazer commit e push.

---

## 🔗 Como a integração funciona no Vercel e no Render

Em produção o desenho é o mesmo do localhost, só trocam os endereços:

| | No seu computador | Em produção |
| --- | --- | --- |
| Front-end (React) | `http://localhost:5173` (Vite) | `https://exemplo-integracao-front.vercel.app` (Vercel) |
| Back-end (esta API) | `http://localhost:8080` | `https://exemplo-integracao-back.onrender.com` (Render) |
| Banco | MongoDB Atlas | MongoDB Atlas (o mesmo) |

```mermaid
sequenceDiagram
    participant N as 🖥️ Navegador do usuário
    participant V as ▲ Vercel (front-end)
    participant R as ☕ Render (esta API)
    participant M as 🍃 MongoDB Atlas

    N->>V: 1. Abre https://exemplo-integracao-front.vercel.app
    V-->>N: 2. Entrega HTML, CSS e JavaScript do React
    N->>R: 3. O JavaScript chama GET https://...onrender.com/api/alunos
    Note over N,R: Origem diferente → o navegador confere o CORS
    R->>M: 4. Spring Boot consulta a coleção "alunos"
    M-->>R: 5. Documentos
    R-->>N: 6. JSON + cabeçalho Access-Control-Allow-Origin
    N->>N: 7. React desenha a lista na tela
```

O que é importante entender:

1. **O Vercel só entrega os arquivos do React.** Ele não conversa com o Render.
2. **Quem chama a API é o navegador do usuário**, diretamente na URL do Render. Por isso:
   - o front precisa saber a URL do Render (no Vercel ela vai na variável `VITE_API_URL`; veja o README do front);
   - esta API precisa liberar a URL do Vercel no CORS (`app.cors.allowed-origins`).
3. **Só o Render fala com o MongoDB Atlas.** A connection string (com a senha) fica no back-end e nunca chega ao navegador.

### Ordem recomendada do deploy

1. **Back-end no Render** → anote a URL (`https://...onrender.com`).
2. **Front-end no Vercel**, com `VITE_API_URL` = URL do Render → anote a URL do Vercel (`https://...vercel.app`).
3. **Volte aqui** e coloque a URL do Vercel no `application.properties`:

   ```properties
   app.cors.allowed-origins=http://localhost:5173,https://SEU-PROJETO.vercel.app
   ```

4. Commit + push → o Render faz o deploy de novo → pronto, front e back integrados.

---

## 🛠️ Problemas comuns

| Sintoma | Causa provável | Solução |
| --- | --- | --- |
| Erro de CORS no console do navegador | A origem do front não está em `app.cors.allowed-origins` | Adicione a URL exata (sem `/` no final) e reinicie / faça novo deploy |
| `"mongodb": "offline"` no `/api/status` | Connection string errada ou IP bloqueado | Confira usuário/senha e o **Network Access** (`0.0.0.0/0`) no Atlas |
| A API não sobe e fala de "connection string inválida" | `app.mongodb.connection-string` ainda tem o texto de exemplo ou está mal formada | Cole a connection string do seu cluster |
| `Port 8080 was already in use` | Outra aplicação usando a porta 8080 | Pare a outra aplicação (ou outro Spring Boot aberto no IntelliJ) |
| `./mvnw: Permission denied` (Mac/Linux) | O arquivo perdeu a permissão de execução | `chmod +x mvnw` |
| `JAVA_HOME is not defined` / versão errada | JDK 17 não instalado ou não configurado | Instale o JDK 17 e configure o `JAVA_HOME` |
| Primeira requisição no Render demora ~1 min | API "dormindo" no plano gratuito | É normal. As próximas são rápidas |

---

## 📚 Links Úteis

| Recurso | Link |
| --- | --- |
| Spring Boot | [https://spring.io/projects/spring-boot](https://spring.io/projects/spring-boot) |
| Spring Data MongoDB | [https://spring.io/projects/spring-data-mongodb](https://spring.io/projects/spring-data-mongodb) |
| MongoDB Atlas | [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas) |
| CORS (MDN) | [https://developer.mozilla.org/pt-BR/docs/Web/HTTP/CORS](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/CORS) |
| Render (Docker) | [https://render.com/docs/docker](https://render.com/docs/docker) |
| Docker | [https://www.docker.com/](https://www.docker.com/) |

---

## 🛡 Licença

Este projeto está sob a licença **MIT**.
