# AraCoffee Back (Spring Boot + MongoDB Atlas) ☕🍃

![Java](https://img.shields.io/badge/Java-17-6f4430?style=for-the-badge&logo=openjdk&logoColor=white) ![Maven](https://img.shields.io/badge/Maven-3.9.11-6f4430?style=for-the-badge&logo=apachemaven&logoColor=white) ![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1.1-6f4430?style=for-the-badge&logo=springboot&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-6f4430?style=for-the-badge&logo=mongodb&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-6f4430?style=for-the-badge&logo=docker&logoColor=white) ![Render](https://img.shields.io/badge/Render-6f4430?style=for-the-badge&logo=render&logoColor=white)

## 📖 Descrição

API REST feita com **Spring Boot** que guarda o **cardápio da cafeteria AraCoffee** no **MongoDB Atlas** (banco na nuvem): cafés, bebidas geladas, chás, doces e salgados, com preço, descrição, destaque do dia e disponibilidade.

Ela é a metade de trás de um par de projetos:

| Projeto | O que é | Porta local |
| --- | --- | --- |
| **Back** (este) | API Spring Boot + MongoDB Atlas | `http://localhost:8080` |
| [**Front**](../Front) | Site da cafeteria em React + Vite que consome esta API | `http://localhost:5173` |

Os dois **rodam ao mesmo tempo e conversam entre si**: o React manda requisições HTTP para o Spring Boot, e o Spring Boot lê e grava no MongoDB.

```mermaid
flowchart LR
    A["🖥️ Navegador<br/>React + Vite<br/>localhost:5173"] -- "HTTP + JSON<br/>GET, POST, PUT, DELETE" --> B["☕ Spring Boot<br/>esta API<br/>localhost:8080"]
    B -- "connection string" --> C[("🍃 MongoDB Atlas<br/>nuvem")]
```

> O formulário de **Contato** (EmailJS), o **mapa** e o **cardápio em PDF** são resolvidos só no front-end. Esta API cuida apenas do cardápio.

---

## 📦 Pacotes e responsabilidades

```text
com.aracoffee.back
├── application   → classe main (sobe a aplicação)
├── config        → lê o application.properties, configura MongoDB e CORS e grava o cardápio inicial
├── controller    → recebe as requisições HTTP do front-end
├── service       → regras de negócio e validações
├── model         → classe Produto (documento do MongoDB) e lista de categorias
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

| Classe | Responsabilidade |
| --- | --- |
| `MongoDBProperties` | Lê `app.mongodb.connection-string` e `app.mongodb.database` |
| `CorsProperties` | Lê `app.cors.allowed-origins` |
| `MongoConfig` | Usa o `MongoDBProperties` para conectar ao MongoDB Atlas (desiste após 5 s sem resposta) |
| `CorsConfig` | Usa o `CorsProperties` para liberar o front-end (veja [CORS](#-cors-por-que-o-front-precisa-de-permissão)) |
| `CardapioInicial` | Ao subir a API, se a coleção `produtos` estiver vazia, grava 11 itens de exemplo. Se o Atlas não responder, só avisa no log |

Como o valor sai do arquivo e chega ao código:

```text
application.properties                                   config/MongoDBProperties.java
─────────────────────────────────────────────           ─────────────────────────────────────
app.mongodb.connection-string=${MONGODB_URI:mongo...} → private String connectionString;
app.mongodb.database=${MONGODB_DATABASE:aracoffee}    → private String database;
        ▲                                                         │
        │ @ConfigurationProperties(prefix = "app.mongodb")        │ injetado no construtor
        │                                                         ▼
        └─────────────────────────────────────────── config/MongoConfig.java → MongoClient
```

#### 🔐 O formato `${VARIAVEL:valor-padrão}`

As três configurações sensíveis aceitam **variável de ambiente**, com um valor padrão escrito no próprio arquivo:

```properties
app.mongodb.connection-string=${MONGODB_URI:mongodb+srv://SEU_USUARIO:SUA_SENHA@...}
```

- **Existe a variável `MONGODB_URI`?** (ex.: no Render) → o Spring usa o valor dela.
- **Não existe?** (ex.: no seu computador) → vale o texto depois dos primeiros dois-pontos.

Assim você pode trabalhar só editando o `application.properties` no seu computador e, no Render, guardar a senha numa variável de ambiente, **sem que ela vá para o GitHub**.

| Variável | Propriedade | Valor padrão |
| --- | --- | --- |
| `MONGODB_URI` | `app.mongodb.connection-string` | texto de exemplo (troque pelo seu) |
| `MONGODB_DATABASE` | `app.mongodb.database` | `aracoffee` |
| `CORS_ORIGINS` | `app.cors.allowed-origins` | `http://localhost:5173,https://aracoffee.vercel.app` |

### 🎮 controller

| Classe | Responsabilidade |
| --- | --- |
| `ProdutoController` | CRUD em `/api/produtos`, mais `/destaques` e `/categorias` |
| `StatusController` | `GET /api/status`: diz se a API está no ar e se o MongoDB responde (usado pelo painel e pelo rodapé do front) |

### 🧠 service

| Classe | Responsabilidade |
| --- | --- |
| `ProdutoService` | Valida os dados (nome obrigatório, categoria conhecida, preço maior que zero, descrição até 160 caracteres), arredonda o preço para centavos e chama o repository |
| `StatusService` | Manda um `ping` para o MongoDB para saber se ele está acessível |

### 🧩 model

| Classe | Responsabilidade |
| --- | --- |
| `Produto` | `@Document(collection = "produtos")` com `id`, `nome`, `descricao`, `categoria`, `preco`, `destaque` e `disponivel` |
| `Categoria` | Lista fixa: `Cafés`, `Bebidas geladas`, `Chás`, `Doces`, `Salgados` (na ordem em que aparecem no site) |

Como um produto fica no Atlas:

```json
{
  "_id": { "$oid": "6712f0c9a1b2c3d4e5f60718" },
  "nome": "Pão de queijo",
  "descricao": "Porção com 4, saindo do forno a cada meia hora.",
  "categoria": "Salgados",
  "preco": 8.5,
  "destaque": true,
  "disponivel": true,
  "_class": "com.aracoffee.back.model.Produto"
}
```

| Campo | Para que serve no site |
| --- | --- |
| `destaque` | `true` → aparece em **Hoje no balcão**, na página inicial, com um grão caramelo |
| `disponivel` | `false` → aparece riscado com o selo **Esgotado hoje** e sai dos destaques |

### 🗄️ repository

| Classe | Responsabilidade |
| --- | --- |
| `ProdutoRepository` | `MongoRepository<Produto, String>`: já traz `findAll`, `findById`, `save`, `deleteById`, `count`. As consultas extras são montadas pelo **nome do método**: |

| Método | Consulta que o Spring Data monta |
| --- | --- |
| `findByNomeContainingIgnoreCaseOrderByNomeAsc` | nome contém o texto, sem diferenciar maiúsculas |
| `findByCategoriaOrderByNomeAsc` | categoria igual à informada |
| `findByNomeContainingIgnoreCaseAndCategoriaOrderByNomeAsc` | as duas condições juntas |
| `findByDestaqueTrueAndDisponivelTrueOrderByNomeAsc` | destaques que não estão esgotados |

### 🚨 exception

| Classe | Responsabilidade |
| --- | --- |
| `ProdutoNaoEncontradoException` | id inexistente → **404** |
| `DadosInvalidosException` | campo inválido → **400** |
| `ErroResposta` | Formato do JSON de erro |
| `GlobalExceptionHandler` | `@RestControllerAdvice` que transforma cada exceção no código HTTP certo |

Todo erro chega ao front-end neste formato. O React lê o campo `mensagem` e mostra na tela:

```json
{
  "status": 400,
  "erro": "Bad Request",
  "mensagem": "Informe um preço maior que zero (ex.: 8.50).",
  "caminho": "/api/produtos",
  "timestamp": "2026-10-18T10:30:00.123"
}
```

| Situação | Código |
| --- | --- |
| Produto não existe | 404 |
| Nome vazio, categoria desconhecida, preço zerado ou descrição longa | 400 |
| JSON mal formado (ou `preco` enviado como texto) | 400 |
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
│   ├── 📁 java/com/aracoffee/back
│   │   ├── 🚀 application
│   │   │   └── BackApplication.java
│   │   │
│   │   ├── ⚙️ config
│   │   │   ├── MongoDBProperties.java  └── Lê app.mongodb.*
│   │   │   ├── CorsProperties.java     └── Lê app.cors.*
│   │   │   ├── MongoConfig.java        └── Conecta ao MongoDB Atlas
│   │   │   ├── CorsConfig.java         └── Libera o front-end (CORS)
│   │   │   └── CardapioInicial.java    └── Grava o cardápio de exemplo
│   │   │
│   │   ├── 🎮 controller
│   │   │   ├── ProdutoController.java  └── /api/produtos
│   │   │   └── StatusController.java   └── /api/status
│   │   │
│   │   ├── 🧠 service
│   │   │   ├── ProdutoService.java     └── Validações + regras de negócio
│   │   │   └── StatusService.java      └── Ping no MongoDB
│   │   │
│   │   ├── 🧩 model
│   │   │   ├── Produto.java            └── Documento da coleção "produtos"
│   │   │   └── Categoria.java          └── Categorias aceitas
│   │   │
│   │   ├── 🗄️ repository
│   │   │   └── ProdutoRepository.java  └── MongoRepository<Produto, String>
│   │   │
│   │   └── 🚨 exception
│   │       ├── ProdutoNaoEncontradoException.java  └── 404
│   │       ├── DadosInvalidosException.java        └── 400
│   │       ├── ErroResposta.java                   └── Formato do JSON de erro
│   │       └── GlobalExceptionHandler.java         └── Exceção → código HTTP
│   │
│   └── 📁 resources
│       └── application.properties
│           └── Porta, MongoDB, CORS e cardápio inicial
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
| GET | `/api/produtos` | Lista o cardápio inteiro (ordem alfabética) | 200 |
| GET | `/api/produtos?nome=pão` | Busca pelo nome | 200 |
| GET | `/api/produtos?categoria=Cafés` | Filtra pela categoria | 200 |
| GET | `/api/produtos?nome=latte&categoria=Cafés` | Os dois filtros juntos | 200 |
| GET | `/api/produtos/destaques` | Destaques disponíveis (página inicial) | 200 |
| GET | `/api/produtos/categorias` | Categorias aceitas | 200 |
| GET | `/api/produtos/{id}` | Busca um produto | 200 / 404 |
| POST | `/api/produtos` | Cadastra um produto | 201 / 400 |
| PUT | `/api/produtos/{id}` | Atualiza um produto | 200 / 400 / 404 |
| DELETE | `/api/produtos/{id}` | Exclui um produto | 204 / 404 |

> `/destaques` e `/categorias` não são confundidos com `/{id}`: no Spring, caminhos fixos têm prioridade sobre caminhos com variável.

Corpo do POST e do PUT:

```json
{
  "nome": "Mocha gelado",
  "descricao": "Espresso, chocolate e leite com gelo.",
  "categoria": "Bebidas geladas",
  "preco": 14.5,
  "destaque": false,
  "disponivel": true
}
```

Testando sem o front-end (terminal, Postman ou Insomnia):

```bash
# Status
curl http://localhost:8080/api/status

# Cadastrar
curl -X POST http://localhost:8080/api/produtos \
  -H "Content-Type: application/json" \
  -d '{"nome":"Mocha gelado","categoria":"Bebidas geladas","preco":14.5}'

# Só os cafés (o "é" vai codificado na URL)
curl "http://localhost:8080/api/produtos?categoria=Caf%C3%A9s"

# Erro de validação (400)
curl -X POST http://localhost:8080/api/produtos \
  -H "Content-Type: application/json" \
  -d '{"nome":"Sem preço","categoria":"Doces"}'
```

---

## 🍃 Configurando o MongoDB Atlas

O Render (onde vamos hospedar a API) oferece banco **PostgreSQL**, não MongoDB. Por isso usamos o **MongoDB Atlas**, que é o MongoDB na nuvem com plano gratuito.

### 1. Criar o cluster

1. Crie uma conta em [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas/register).
2. Crie um cluster **Free (M0)**. Escolha a região mais próxima (ex.: São Paulo).

### 2. Criar o usuário do banco

Em **Security > Database Access > Add New Database User**:

- Método: **Password**
- Usuário e senha: anote os dois (dica: use uma senha só com letras e números)
- Permissão: **Read and write to any database**

### 3. Liberar o acesso pela rede

Em **Security > Network Access > Add IP Address**, clique em **Allow Access from Anywhere** (`0.0.0.0/0`).

> O plano gratuito do Render não tem IP fixo, então o Atlas precisa aceitar conexões de qualquer IP. Sem isso, a API funciona no seu computador mas não no Render.

### 4. Copiar a connection string

Em **Database > Connect > Drivers**, escolha **Java** e copie a string:

```text
mongodb+srv://USUARIO:<db_password>@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

Troque `<db_password>` pela senha do usuário (sem os sinais `< >`).

> ⚠️ Se a senha tiver caracteres especiais, eles precisam ser codificados: `@` → `%40`, `:` → `%3A`, `/` → `%2F`, `?` → `%3F`, `#` → `%23`, `%` → `%25`.

### 5. Colar no `application.properties`

Troque **só o texto depois de `MONGODB_URI:`** (mantenha o `${` no começo e o `}` no fim):

```properties
app.mongodb.connection-string=${MONGODB_URI:mongodb+srv://joao:minhasenha123@cluster0.abcde.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0}
app.mongodb.database=${MONGODB_DATABASE:aracoffee}
```

Não precisa criar o banco nem a coleção: na primeira vez que a API sobe, o `CardapioInicial` grava 11 produtos e o Atlas cria o banco `aracoffee` e a coleção `produtos`. Para ver os dados, abra **Database > Browse Collections**.

> ⚠️ **Cuidado ao subir para o GitHub:** se a senha estiver escrita no `application.properties`, quem vir o repositório vê a senha. Prefira deixar o valor de exemplo no arquivo e usar a variável `MONGODB_URI` no Render (veja o [deploy](#️-deploy-no-render)), ou use um **repositório privado**.

---

## 📄 `application.properties` completo

```properties
spring.application.name=AraCoffee

# Porta da API (o front chama http://localhost:8080)
server.port=8080

# MongoDB Atlas (lido por config/MongoDBProperties.java)
app.mongodb.connection-string=${MONGODB_URI:mongodb+srv://SEU_USUARIO:SUA_SENHA@SEU_CLUSTER.xxxxxxx.mongodb.net/?retryWrites=true&w=majority}
app.mongodb.database=${MONGODB_DATABASE:aracoffee}

# CORS (lido por config/CorsProperties.java)
app.cors.allowed-origins=${CORS_ORIGINS:http://localhost:5173,https://aracoffee.vercel.app}

# Cardápio de exemplo quando a coleção está vazia (lido por config/CardapioInicial.java)
app.cardapio.popular-ao-iniciar=true
```

---

## 🔓 CORS: por que o front precisa de permissão?

O navegador considera que duas URLs têm a **mesma origem** só quando **protocolo, domínio e porta** são iguais:

| Front-end | Back-end | Mesma origem? |
| --- | --- | --- |
| `http://localhost:5173` | `http://localhost:8080` | ❌ porta diferente |
| `https://aracoffee.vercel.app` | `https://aracoffee-back.onrender.com` | ❌ domínio diferente |

Por segurança, quando um JavaScript de uma origem chama uma API de **outra** origem, o navegador só entrega a resposta se a API disser: "essa origem pode me chamar". Essa autorização se chama **CORS** (*Cross-Origin Resource Sharing*). Sem ela, o console (F12) mostra:

```text
Access to fetch at 'http://localhost:8080/api/produtos' from origin 'http://localhost:5173'
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header is present...
```

- **Quem bloqueia é o navegador**, não o Spring Boot. Por isso a mesma URL funciona no Postman ou no `curl`, mas falha no React.
- **A permissão é dada pelo back-end.** O front-end não consegue "se liberar" sozinho.

Neste projeto, quem dá a permissão é o `CorsConfig`, usando a lista do `application.properties`:

```properties
app.cors.allowed-origins=${CORS_ORIGINS:http://localhost:5173,https://aracoffee.vercel.app}
```

> Escreva as origens **sem barra no final**. Também é possível usar curinga, como `https://*.vercel.app`, para aceitar as URLs de preview do Vercel.

---

## 🚀 Como rodar

### Pré-requisitos

- **JDK 17** instalado. Confira com `java -version`.
- MongoDB Atlas configurado (seção acima).
- Maven **não** precisa estar instalado: o **Maven Wrapper** (`mvnw` / `mvnw.cmd`) baixa o Maven 3.9.11 sozinho na primeira execução.

### Só o back-end

```bash
# macOS / Linux
./mvnw spring-boot:run

# Windows (cmd ou PowerShell)
.\mvnw.cmd spring-boot:run
```

Ou abra o projeto no IntelliJ e rode a classe `BackApplication`.

Depois abra [http://localhost:8080/api/status](http://localhost:8080/api/status):

```json
{ "api": "online", "mongodb": "online" }
```

Se aparecer `"mongodb": "offline"`, a API está funcionando, mas não alcançou o Atlas: confira a connection string e o Network Access.

### Back-end + front-end juntos (um terminal só) ⭐

Os dois projetos precisam ficar **lado a lado na mesma pasta**:

```text
📁 AraCoffee
├── 📁 Back    ← este projeto (porta 8080)
└── 📁 Front   ← site em React (porta 5173)
```

```bash
cd Front
npm install               # só na primeira vez

npm run dev:all           # macOS / Linux
npm run dev:all:windows   # Windows
```

O passo a passo completo está no [README do front-end](../Front/README.md#-rodando-os-dois-projetos-ao-mesmo-tempo).

---

## 🐳 Docker

O Render não tem uma opção nativa para Java. A forma mais simples de publicar um Spring Boot nele é com **Docker**: o Render lê o `Dockerfile`, monta uma imagem e roda o container.

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

**Etapa 1: compilar**

- **`FROM maven:3.9-eclipse-temurin-17 AS build`**: imagem com Maven e JDK 17, usada só para gerar o `.jar`.
- **`COPY pom.xml .` + `RUN mvn dependency:go-offline`**: baixa as dependências antes de copiar o código. Se só o código mudar, o Docker reaproveita esse passo (cache).
- **`COPY src ./src` + `RUN mvn clean package -DskipTests`**: compila e gera `target/Back-0.0.1-SNAPSHOT.jar`.

**Etapa 2: executar**

- **`FROM eclipse-temurin:17-jre`**: imagem bem menor, só com o Java necessário para **rodar**.
- **`COPY --from=build ... app.jar`**: traz apenas o `.jar` da etapa 1.
- **`EXPOSE 8080`**: a mesma porta do `server.port`.
- **`-XX:MaxRAMPercentage=75`**: limita o Java a 75% da memória, porque o plano gratuito do Render tem só 512 MB.

### Testando o Docker no seu computador (opcional)

```bash
docker build -t aracoffee-back .
docker run -p 8080:8080 -e MONGODB_URI="mongodb+srv://..." aracoffee-back
```

---

## ☁️ Deploy no Render

### Passo a passo

1. Suba o projeto para o GitHub.
2. No [Render](https://render.com/), clique em **New > Web Service** e conecte o repositório.
3. Preencha:

| Campo | Valor |
| --- | --- |
| **Name** | `aracoffee-back` (vira parte da URL) |
| **Language / Runtime** | `Docker` |
| **Branch** | `main` |
| **Root Directory** | vazio se o repositório tiver só este projeto. Se tiver o front e o back juntos, coloque `Back` |
| **Instance Type** | `Free` |

4. Em **Environment Variables**, adicione:

| Key | Value |
| --- | --- |
| `PORT` | `8080` (só avisa ao Render qual porta o container usa) |
| `MONGODB_URI` | a connection string completa do Atlas, com a senha |
| `CORS_ORIGINS` | `http://localhost:5173,https://SEU-PROJETO.vercel.app` (preencha depois do deploy do front) |

5. Clique em **Deploy Web Service** e acompanhe os **Logs**. O primeiro build leva alguns minutos. Procure a linha `Cardápio de exemplo gravado` (só na primeira vez) e `Started BackApplication`.
6. Quando terminar, o Render mostra a URL da API, por exemplo:

```text
https://aracoffee-back.onrender.com
```

Abra `https://aracoffee-back.onrender.com/api/status` e confira se aparece `"mongodb": "online"`.

> 💤 **Plano gratuito:** o Render "dorme" a API depois de 15 minutos sem acesso. A primeira requisição depois disso leva **até 1 minuto**. O site mostra "Abrindo o cardápio…" enquanto isso.

### Toda alteração = novo deploy

O Render faz deploy automático a cada `git push`. Alterou uma **variável de ambiente**? Ele reinicia o serviço sozinho ao salvar.

---

## 🔗 Como a integração funciona no Vercel e no Render

| | No seu computador | Em produção |
| --- | --- | --- |
| Front-end (React) | `http://localhost:5173` (Vite) | `https://aracoffee.vercel.app` (Vercel) |
| Back-end (esta API) | `http://localhost:8080` | `https://aracoffee-back.onrender.com` (Render) |
| Banco | MongoDB Atlas | MongoDB Atlas (o mesmo) |

```mermaid
sequenceDiagram
    participant N as 🖥️ Navegador do cliente
    participant V as ▲ Vercel (front-end)
    participant R as ☕ Render (esta API)
    participant M as 🍃 MongoDB Atlas

    N->>V: 1. Abre https://aracoffee.vercel.app/cardapio
    V-->>N: 2. Entrega HTML, CSS e JavaScript do React
    N->>R: 3. O JavaScript chama GET https://...onrender.com/api/produtos
    Note over N,R: Origem diferente → o navegador confere o CORS
    R->>M: 4. Spring Boot consulta a coleção "produtos"
    M-->>R: 5. Documentos
    R-->>N: 6. JSON + cabeçalho Access-Control-Allow-Origin
    N->>N: 7. React desenha o cardápio na tela
```

1. **O Vercel só entrega os arquivos do React.** Ele não conversa com o Render.
2. **Quem chama a API é o navegador do cliente**, direto na URL do Render. Por isso o front precisa da variável `VITE_API_URL`, e esta API precisa liberar a URL do Vercel no CORS.
3. **Só o Render fala com o MongoDB Atlas.** A connection string nunca chega ao navegador.

### Ordem recomendada do deploy

1. **Back-end no Render** → anote a URL (`https://...onrender.com`).
2. **Front-end no Vercel**, com `VITE_API_URL` = URL do Render → anote a URL do Vercel.
3. **Volte ao Render** e coloque a URL do Vercel em `CORS_ORIGINS` (ou no `application.properties` + push).

---

## 🛠️ Problemas comuns

| Sintoma | Causa provável | Solução |
| --- | --- | --- |
| Erro de CORS no console do navegador | A origem do front não está liberada | Adicione a URL exata (sem `/` no final) em `CORS_ORIGINS` ou no `application.properties` |
| `"mongodb": "offline"` no `/api/status` | Connection string errada ou IP bloqueado | Confira usuário/senha e o **Network Access** (`0.0.0.0/0`) |
| Cardápio vazio na primeira vez | O Atlas não respondeu quando a API subiu | Corrija a conexão e reinicie a API: o `CardapioInicial` roda de novo |
| A API não sobe e fala de "connection string inválida" | Texto de exemplo ou `${...}` apagado sem querer | Mantenha o formato `${MONGODB_URI:sua-string}` |
| `Port 8080 was already in use` | Outra aplicação usando a porta | Pare a outra aplicação (ou outro Spring Boot aberto) |
| `./mvnw: Permission denied` (Mac/Linux) | O arquivo perdeu a permissão de execução | `chmod +x mvnw` |
| `JAVA_HOME is not defined` | JDK 17 não configurado | Instale o JDK 17 e configure o `JAVA_HOME` |
| Primeira requisição no Render demora ~1 min | API "dormindo" no plano gratuito | É normal |

---

## 📚 Links Úteis

| Recurso | Link |
| --- | --- |
| Spring Boot | [https://spring.io/projects/spring-boot](https://spring.io/projects/spring-boot) |
| Spring Data MongoDB | [https://spring.io/projects/spring-data-mongodb](https://spring.io/projects/spring-data-mongodb) |
| MongoDB Atlas | [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas) |
| CORS (MDN) | [https://developer.mozilla.org/pt-BR/docs/Web/HTTP/CORS](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/CORS) |
| Render (Docker) | [https://render.com/docs/docker](https://render.com/docs/docker) |
| Render (variáveis de ambiente) | [https://render.com/docs/configure-environment-variables](https://render.com/docs/configure-environment-variables) |

---

## 🛡 Licença

Este projeto está sob a licença **MIT**.
