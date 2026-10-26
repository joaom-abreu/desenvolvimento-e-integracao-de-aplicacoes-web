# 🎯 PalpiteDTI · Jogo de adivinhação de 1 a 100

![Java](https://img.shields.io/badge/Java-17-000066?style=for-the-badge&logo=openjdk&logoColor=white) ![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1-000066?style=for-the-badge&logo=springboot&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-000066?style=for-the-badge&logo=mongodb&logoColor=white) ![React](https://img.shields.io/badge/React-19-000066?style=for-the-badge&logo=react&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-8-000066?style=for-the-badge&logo=vite&logoColor=white) ![Sass](https://img.shields.io/badge/SCSS_+_PostCSS-000066?style=for-the-badge&logo=sass&logoColor=white) ![JUnit](https://img.shields.io/badge/JUnit_5_+_Mockito-000066?style=for-the-badge&logo=junit5&logoColor=white) ![Vitest](https://img.shields.io/badge/Vitest-000066?style=for-the-badge&logo=vitest&logoColor=white) ![k6](https://img.shields.io/badge/Grafana_k6-000066?style=for-the-badge&logo=k6&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-000066?style=for-the-badge&logo=docker&logoColor=white) ![Vercel](https://img.shields.io/badge/Vercel-000066?style=for-the-badge&logo=vercel&logoColor=white) ![Render](https://img.shields.io/badge/Render-000066?style=for-the-badge&logo=render&logoColor=white)

Solução completa do **teste técnico da dti digital (Rackers)**: uma aplicação web em que o usuário tenta adivinhar o **número inteiro de 1 a 100 sorteado pelo sistema**. A cada palpite, o **back-end** responde se o número informado é **maior** ou **menor** que o sorteado; ao acertar, o jogador é avisado, entra no **ranking** e pode começar uma **nova rodada** com um novo número.

> 📄 **Antes de rodar, leia o enunciado:** [`docs/Teste dti - Rackers.pdf`](docs/Teste%20dti%20-%20Rackers.pdf). Todo este README faz referência às regras de lá. Entender o problema primeiro é exatamente o que o avaliador espera de você.

| Camada | Tecnologia | Onde roda (produção) |
| --- | --- | --- |
| Front-end | React 19 + Vite 8 + React Router + SCSS/PostCSS | Vercel → `palpite-dti.vercel.app` |
| Back-end | Spring Boot 4 (java 17) · API REST | Render (Docker) |
| Banco | MongoDB Atlas (local: MongoDB no Docker) | Atlas M0 (grátis) |
| Testes | JUnit 5 + Mockito + MockMvc · Vitest + Testing Library | GitHub Actions |
| Carga e observabilidade | Grafana k6 + Prometheus + Grafana | Local (docker-compose) |

---

## 🖼️ Capturas de tela

| Rodada em andamento (tabuleiro + dica) | Acerto, com a posição no ranking |
| :---: | :---: |
| ![Jogar](https://joaopauloaramuni.github.io/react-imgs/PalpiteDTI/imgs/Jogar.png) | ![Acerto](https://joaopauloaramuni.github.io/react-imgs/PalpiteDTI/imgs/Acerto.png) |

| Validação na tela (fora de 1 a 100) | Desistência: o número é revelado |
| :---: | :---: |
| ![Erro de validação](https://joaopauloaramuni.github.io/react-imgs/PalpiteDTI/imgs/ErroValidacao.png) | ![Desistência](https://joaopauloaramuni.github.io/react-imgs/PalpiteDTI/imgs/Desistencia.png) |

| Ranking (salvo no MongoDB) | Estatísticas |
| :---: | :---: |
| ![Ranking](https://joaopauloaramuni.github.io/react-imgs/PalpiteDTI/imgs/Ranking.png) | ![Estatísticas](https://joaopauloaramuni.github.io/react-imgs/PalpiteDTI/imgs/Estatisticas.png) |

| Design system (`/design`) | Mobile |
| :---: | :---: |
| ![Design system](https://joaopauloaramuni.github.io/react-imgs/PalpiteDTI/imgs/DesignSystem.png) | <img src="https://joaopauloaramuni.github.io/react-imgs/PalpiteDTI/imgs/Mobile.png" alt="Mobile" width="300"/> |

> As imagens ficam na pasta [`imgs/`](imgs) deste repositório e são servidas pelo GitHub Pages. Para usar no seu fork, publique a pasta no seu GitHub Pages e troque a URL base `https://joaopauloaramuni.github.io/react-imgs/PalpiteDTI/imgs` (um "localizar e substituir" no README resolve).

---

## 🧭 Sumário

1. [O desafio em 1 minuto](#-o-desafio-em-1-minuto)
2. [Checklist: o que o PDF pede × onde está](#-checklist-o-que-o-pdf-pede--onde-está)
3. [Premissas assumidas](#-premissas-assumidas)
4. [Decisões de projeto](#-decisões-de-projeto)
5. [Arquitetura (componentes, implantação e sequência)](#️-arquitetura)
6. [A regra do jogo e a busca binária](#-a-regra-do-jogo-e-a-busca-binária)
7. [Diagrama de estados](#-diagrama-de-estados)
8. [Estrutura do projeto](#-estrutura-do-projeto)
9. [Endpoints da API](#-endpoints-da-api)
10. [Como rodar](#-como-rodar)
11. [MongoDB Atlas](#-mongodb-atlas)
12. [Testes automatizados](#-testes-automatizados)
13. [Testes de carga e observabilidade (k6 + Grafana)](#-testes-de-carga-e-observabilidade)
14. [Ranking e estatísticas](#-ranking-e-estatísticas)
15. [Design system (SCSS + PostCSS)](#-design-system)
16. [Deploy (Vercel + Render + domínio)](#️-deploy)
17. [Uso de IA](#-uso-de-ia)
18. [Problemas comuns](#️-problemas-comuns)
19. [Próximos passos](#-próximos-passos)

> 🎤 Vai apresentar este projeto numa entrevista? Leia o [**ROTEIRO.md**](ROTEIRO.md): por onde começar, o que mostrar e as perguntas que costumam aparecer.

---

## 🎯 O desafio em 1 minuto

*"Você faz parte de um squad da dti e, a partir de um alinhamento com o cliente, foi priorizada uma estória que consiste na construção de uma aplicação onde o usuário deve adivinhar qual número aleatório foi gerado pelo sistema."*

O sistema precisa:

- permitir **informar um número entre 1 e 100**;
- **informar se o número é maior ou menor** que o sorteado;
- avisar o **acerto** e permitir **uma nova rodada**, com novo número sorteado;
- fazer **todo o cálculo no back-end**.

E é avaliado por: código executável, requisitos funcionais, **separação de responsabilidades**, clareza, **tratamento de erros e mensagens de feedback**, **HTML semântico**. Bônus: **pré/pós-processadores de CSS**, **API RESTful** (rotas, métodos e status HTTP), **testes unitários no front e no back**, **ranking salvo em banco** e página harmônica.

Neste projeto, uma rodada se chama **partida**. O número sorteado mora só no servidor; o navegador conhece apenas a **faixa possível** (ex.: "entre 26 e 49"), que encolhe a cada resposta.

---

## ✅ Checklist: o que o PDF pede × onde está

| O PDF pede | Status | Onde está no código |
| --- | :---: | --- |
| Informar um número entre 1 e 100 | ✅ | `PalpiteForm.jsx` (tela) e `Arbitro.registrar` (regra, 422 fora da faixa) |
| Dizer se é maior ou menor que o sorteado | ✅ | `jogo/Juiz` + `jogo/Narrador` (mensagem pronta para a tela) |
| Avisar o acerto e permitir nova rodada | ✅ | status `VENCIDA`, `ResultadoFinal.jsx` (botão **Jogar de novo**) |
| Novo número sorteado a cada rodada | ✅ | `POST /api/partidas` → `Sorteador` (`SecureRandom`) |
| **Cálculos todos no back-end** | ✅ | `Juiz.julgar`; o front nunca recebe o número enquanto a partida está aberta |
| Web, com front-end e back-end | ✅ | `Front/` (React + Vite) e `Back/` (Spring Boot) |
| Código executável + instruções | ✅ | [Como rodar](#-como-rodar) (3 opções, inclusive Docker em 1 comando) |
| Separação de responsabilidades, OO | ✅ | controller → service → `jogo` (Java puro) → repository |
| Tratamento de erros e feedback | ✅ | `GlobalExceptionHandler` (400/404/409/422/503), validação na tela, dica de palpite desperdiçado |
| HTML semântico | ✅ | `header`, `nav`, `main`, `section`, `form`/`label`, `ol`, `table`/`caption`, `figure`/`figcaption`, `footer` |
| Preferencialmente sem bibliotecas de componentes | ✅ | nenhuma; os gráficos são SVG feitos à mão (`GraficoBarras.jsx`) |
| Banco de configuração simples | ✅ | MongoDB Atlas (cria banco e coleção sozinho) ou Docker local |
| Uso de IA explicado | ✅ | [`docs/IA.md`](docs/IA.md) |
| Premissas e decisões de projeto | ✅ | seções [Premissas](#-premissas-assumidas) e [Decisões](#-decisões-de-projeto) |
| **Bônus:** pré/pós-processador de CSS | ✅ | SCSS (partials, mixins, `@use`) + PostCSS/Autoprefixer |
| **Bônus:** API RESTful, rotas, métodos e status | ✅ | recursos `/partidas`, `/partidas/{id}/palpites`; 201 + `Location` |
| **Bônus:** testes unitários no front e no back | ✅ | `Back/src/test` (JUnit 5, Mockito, MockMvc) e `Front/src/**/*.test.jsx` (Vitest) |
| **Bônus:** ranking com nomes e menor nº de tentativas, salvo no banco | ✅ | `GET /api/ranking`, `RankingService`, página **Ranking** |
| **Bônus:** novas funcionalidades | ✅ | estatísticas, dica de palpite desperdiçado, desistência, tabuleiro clicável, F5 não perde a rodada |
| **Bônus:** página harmônica, campos alinhados | ✅ | design system dti, página [`/design`](#-design-system) |

---

## 📌 Premissas assumidas

O PDF pede que as premissas sejam entregues. Onde o enunciado não definia, a decisão foi registrada aqui **e** deixada configurável quando fazia sentido.

| # | Premissa | Onde está |
| --- | --- | --- |
| 1 | O PDF pede **.NET**; esta solução usa **Java 17 + Spring Boot** (mesma arquitetura em camadas que seria usada em .NET). | todo o `Back/` |
| 2 | O PDF sugere SQLite; usamos **MongoDB Atlas**, também de configuração simples (uma connection string) e com plano grátis na nuvem. | `config/MongoConfig` |
| 3 | "Maior" e "menor" sempre comparam **o palpite com o sorteado**: *"50 é maior que o número sorteado. Tente um número menor."* | `jogo/Narrador` |
| 4 | Os limites são **inclusivos**: 1 e 100 podem ser sorteados (há teste). | `SorteadorAleatorioTest` |
| 5 | Palpite **repetido** é recusado (422) e **não conta** como tentativa. | `Arbitro.registrar` |
| 6 | Palpite com casas decimais (42,5) é **recusado** (400), nunca arredondado. | `PalpiteRequest` (`BigDecimal` + `@Digits`) |
| 7 | Palpite fora da faixa já indicada pelas respostas (ex.: 70 depois de "50 é maior") **é aceito e conta**, mas recebe uma **dica**. É uma jogada ruim, não um erro. | `Narrador.dica` |
| 8 | O nome do jogador é **opcional** (até 30 caracteres); sem nome, "Anônimo". | `NovaPartidaRequest`, `PartidaService` |
| 9 | O jogador pode **desistir**; o número é revelado e a partida não entra no ranking. | `POST /api/partidas/{id}/desistencia` |
| 10 | Ranking: só partidas **vencidas**; menos tentativas, depois menos tempo, depois quem terminou antes. | `RankingService.ORDEM` |
| 11 | Não há login. A partida aberta é lembrada pelo navegador (`localStorage` guarda só o **id**, nunca o número). | `hooks/usePartida.js` |
| 12 | Na primeira subida com banco vazio, **30 partidas jogadas por robôs** são criadas para o ranking e as estatísticas não abrirem vazios (marcadas como "robô"). Desligável. | `config/DadosIniciais` |

---

## 🧩 Decisões de projeto

| Decisão | Por quê | Custo / alternativa |
| --- | --- | --- |
| Número secreto **nunca** sai do servidor enquanto a partida está aberta | o PDF pede o cálculo no back-end; se o número fosse ao front, bastaria abrir o F12 | o front não consegue validar o acerto sozinho (e não deve) |
| Regras do jogo num pacote **`jogo` em Java puro** (`Arbitro`, `Juiz`, `Intervalo`) | separação de responsabilidades: testável sem Spring nem banco | uma camada a mais para quem está começando |
| **Partida com palpites embutidos** (um documento) | partida e palpites são sempre lidos e gravados juntos; sem join | documento cresce com os palpites (no máximo 100) |
| **`@Version`** (concorrência otimista) na `Partida` | dois palpites simultâneos (duas abas) não se sobrescrevem: o segundo recebe 409 | quem perde a corrida precisa tentar de novo |
| **400 × 409 × 422** bem separados | 400 = formato; 409 = estado do recurso; 422 = regra do jogo. O front mostra a `mensagem` sem precisar saber o motivo | exige disciplina para não usar 400 para tudo |
| Desistência como recurso: **`POST /partidas/{id}/desistencia`** | `DELETE` apagaria a partida, que precisa continuar nas estatísticas | `PATCH /partidas/{id}` com o status também seria válido |
| **`Sorteador` como interface** (padrão Strategy) | produção usa `SecureRandom` (imprevisível); testes usam uma lambda que sempre devolve 42 | nenhum |
| **`Clock` injetado** | testes controlam o tempo (duração da partida) | nenhum |
| **Validação nos dois lados** | front: resposta imediata; back: fonte da verdade (o front pode ser burlado) | regras repetidas em JS e Java (cobertas por testes nos dois) |
| **Sem bibliotecas de componentes**; gráficos em **SVG próprio** | preferência explícita do PDF; menos dependências | gráficos mais simples que os de uma biblioteca |
| **SCSS + Autoprefixer** | bônus do PDF; partials e mixins organizam o design system | um passo de build a mais (o Vite faz sozinho) |
| Tokens como **variáveis CSS** (e não só variáveis Sass) | ficam visíveis no DevTools e no JS (`/design` lê as cores) | — |
| Estatísticas calculadas **em memória** | simples e fácil de testar com Mockito | com milhões de partidas, usar *aggregation pipeline* (ver [Próximos passos](#-próximos-passos)) |
| Partidas de exemplo jogadas por **robôs que usam o mesmo `Arbitro`** | dados realistas para a demo, sem duplicar regra | marcadas como "robô" no ranking |

---

## 🏗️ Arquitetura

### Diagrama de componentes

![Diagrama de componentes](https://joaopauloaramuni.github.io/react-imgs/PalpiteDTI/imgs/diagrama-componentes.png)

<details>
<summary>Código Mermaid (o GitHub desenha sozinho)</summary>

```mermaid
flowchart LR
    subgraph Navegador["Navegador · React + Vite"]
        P["Páginas<br/>Jogar · Ranking<br/>Estatísticas · Design"]
        H["usePartida<br/>usePolling (5 s)"]
        S["services/api.js<br/>httpClient.js"]
        P --> H --> S
    end

    subgraph API["Spring Boot · API REST"]
        C["controller<br/>Partida · Ranking · Estatistica<br/>Simulacao · Status"]
        SV["service<br/>PartidaService · RankingService<br/>EstatisticaService · SimulacaoService"]
        J["jogo (Java puro)<br/>Arbitro · Juiz · Intervalo<br/>Narrador · Desempenho · Sorteador"]
        R["repository<br/>PartidaRepository"]
        EX["exception<br/>GlobalExceptionHandler"]
        C --> SV --> J
        SV --> R
        C -. erro .-> EX
    end

    DB[("MongoDB<br/>partidas<br/>(palpites embutidos)")]
    S -- "HTTP + JSON" --> C
    R --> DB
```
</details>

**A dinâmica entre as partes, em 5 frases:**

1. O **React** nunca decide nada do jogo: ele valida o campo, envia o palpite e mostra a resposta. O hook `usePartida` concentra a conversa com a API.
2. O **controller** só traduz HTTP ↔ Java: valida o formato do JSON (`@Valid`) e devolve o status certo (201, 400, 404, 409, 422).
3. O **service** orquestra: carrega a partida, chama o **Arbitro** e grava. O `Arbitro` (pacote `jogo`, **Java puro**) aplica as regras e pergunta ao `Juiz` se o palpite é maior, menor ou certo.
4. O **`GlobalExceptionHandler`** transforma qualquer exceção num JSON padronizado com uma `mensagem` pronta para a tela.
5. O **repository** (Spring Data) guarda a partida, com os palpites dentro, no **MongoDB**.

### Camadas do back-end

```text
com.dti.palpite
├── PalpiteApplication  → main
├── controller          → porta HTTP: recebe, valida o formato, devolve status
├── dto                 → formato de entrada/saída da API (records Java); esconde o número secreto
├── service             → orquestração: carrega, chama o Arbitro, grava, monta a resposta
├── jogo                → Java puro: Arbitro, Juiz, Intervalo, Narrador, Desempenho, Sorteador, robôs
├── repository          → interface MongoRepository (o Spring gera a implementação)
├── model               → documento do MongoDB (Partida, com Palpite embutido) e enums
├── config              → properties, CORS, conexão com o MongoDB, beans, dados iniciais
└── exception           → exceções de negócio + GlobalExceptionHandler (JSON de erro padronizado)
```

| Pacote | Classes principais | Responsabilidade |
| --- | --- | --- |
| `controller` | `PartidaController`, `RankingController`, `EstatisticaController`, `SimulacaoController`, `StatusController` | Endpoints REST |
| `service` | `PartidaService`, `RankingService`, `EstatisticaService`, `SimulacaoService`, `StatusService` | Orquestração |
| `jogo` | `Arbitro`, `Juiz`, `Intervalo`, `Narrador`, `Desempenho`, `Sorteador`, `JogadorAutomatico` | Regras (sem Spring) |
| `repository` | `PartidaRepository` | Acesso ao MongoDB |
| `model` | `Partida`, `Palpite`, `StatusPartida`, `ResultadoPalpite` | Dados persistidos |
| `dto` | `PalpiteRequest`, `PartidaResponse`, `ResultadoPalpiteResponse`, `RankingItemResponse`, `EstatisticasResponse`... | Contrato da API |
| `config` | `MongoConfig`, `CorsConfig`, `JogoProperties`, `BeansConfig`, `DadosIniciais` | Configuração |
| `exception` | `RegraNegocioException` (422), `ConflitoException` (409), `RecursoNaoEncontradoException` (404), `GlobalExceptionHandler` | Erros claros |

### Diagrama de implantação

![Diagrama de implantação](https://joaopauloaramuni.github.io/react-imgs/PalpiteDTI/imgs/diagrama-implantacao.png)

<details>
<summary>Código Mermaid</summary>

```mermaid
flowchart LR
    U["👩‍💻 Jogador<br/>navegador"]
    subgraph Vercel["Vercel (CDN)"]
        F["React + Vite (dist/)<br/>palpite-dti.vercel.app"]
    end
    subgraph Render["Render (Docker)"]
        B["Spring Boot (JAR, java 17)<br/>palpite-dti-api.onrender.com"]
    end
    subgraph Atlas["MongoDB Atlas (M0)"]
        M[("PalpiteDTI")]
    end
    subgraph Obs["Observabilidade (local, docker-compose)"]
        K["k6<br/>testes de carga"]
        PR["Prometheus"]
        G["Grafana"]
    end
    GH["GitHub<br/>repositório privado"]

    U -- "HTTPS: HTML/JS/CSS" --> F
    U -- "HTTPS: fetch /api/*<br/>(CORS)" --> B
    B -- "mongodb+srv:// (TLS)" --> M
    GH -- "push = deploy" --> F
    GH -- "push = deploy" --> B
    K -- "requisições" --> B
    K -- "remote write" --> PR
    PR -- "scrape /actuator/prometheus" --> B
    G --> PR
```
</details>

- O **navegador** baixa o site estático do **Vercel** (CDN) e chama a API do **Render** direto, por HTTPS. Por serem domínios diferentes, a API libera o front via **CORS**.
- O **Render** constrói a imagem Docker do back-end (`Back/Dockerfile`) a cada `git push`.
- O back-end fala com o **MongoDB Atlas** pela connection string (`MONGODB_URI`), sempre com TLS.
- Em testes de carga, o **k6** gera tráfego, o **Prometheus** coleta as métricas do k6 e do Spring (`/actuator/prometheus`) e o **Grafana** desenha os gráficos.

### Diagrama de sequência: um palpite

![Diagrama de sequência](https://joaopauloaramuni.github.io/react-imgs/PalpiteDTI/imgs/diagrama-sequencia-palpite.png)

<details>
<summary>Código Mermaid</summary>

```mermaid
sequenceDiagram
    autonumber
    actor Jogador
    participant React
    participant Controller as PartidaController
    participant Service as PartidaService
    participant Arbitro as Arbitro + Juiz
    participant Mongo as MongoDB

    Jogador->>React: digita 50 e aperta Enter
    React->>React: validarPalpite (vazio? inteiro? 1 a 100? repetido?)
    React->>Controller: POST /api/partidas/{id}/palpites { "numero": 50 }
    Controller->>Controller: @Valid (inteiro, obrigatório)
    Controller->>Service: palpitar(id, request)
    Service->>Mongo: findById(id)
    alt partida não existe
        Service-->>React: 404 { mensagem }
    end
    Service->>Arbitro: registrar(partida, 50, agora)
    alt encerrada / fora da faixa / repetido
        Arbitro-->>React: 409 ou 422 { mensagem }
    else ok
        Arbitro->>Arbitro: Juiz.julgar(50, secreto) = MAIOR
        Service->>Mongo: save(partida) [@Version]
        Service-->>React: 201 { mensagem, dica, partida (sem o número) }
    end
    React-->>Jogador: "50 é maior que o número sorteado. Tente um número menor."
```
</details>

### Modelo de dados

![Diagrama de classes](https://joaopauloaramuni.github.io/react-imgs/PalpiteDTI/imgs/diagrama-classes.png)

Uma **Partida** guarda tudo da rodada: o número secreto, os limites, o status, os **palpites embutidos** (número, resposta do juiz e momento) e a duração. Como documento do MongoDB, fica tudo junto e é lido de uma vez. O campo `tentativas` repete `palpites.size()` de propósito: assim o ranking ordena **direto no banco**, com o índice composto `{status, tentativas, duracaoSegundos, finalizadaEm}`.

Exemplo de documento na coleção `partidas`:

```json
{
  "_id": "6719f0...",
  "jogador": "Ana",
  "numeroSecreto": 31,
  "minimo": 1, "maximo": 100,
  "status": "VENCIDA",
  "palpites": [
    { "numero": 50, "resultado": "MAIOR", "momento": "2026-10-26T12:00:05Z" },
    { "numero": 25, "resultado": "MENOR", "momento": "2026-10-26T12:00:11Z" },
    { "numero": 37, "resultado": "MAIOR", "momento": "2026-10-26T12:00:18Z" },
    { "numero": 31, "resultado": "ACERTOU", "momento": "2026-10-26T12:00:26Z" }
  ],
  "tentativas": 4,
  "iniciadaEm": "2026-10-26T12:00:00Z",
  "finalizadaEm": "2026-10-26T12:00:26Z",
  "duracaoSegundos": 26,
  "simulada": false,
  "versao": 4
}
```

---

## 🧠 A regra do jogo e a busca binária

### O caminho de um palpite (`Arbitro.registrar`)

As verificações acontecem nesta ordem, e cada uma tem o seu código HTTP:

| # | Verificação | Se falhar | Mensagem |
| --- | --- | --- | --- |
| 0 | o corpo tem `numero` inteiro? (`@Valid` no controller) | **400** | `O palpite precisa ser um número inteiro, sem casas decimais.` |
| 1 | a partida existe? | **404** | `Partida com id "x" não encontrada.` |
| 2 | a partida ainda está em andamento? | **409** | `Esta partida já terminou (vencida). Comece uma nova rodada...` |
| 3 | o número está entre 1 e 100? | **422** | `Escolha um número entre 1 e 100. Você enviou 150.` |
| 4 | o número ainda não foi tentado? | **422** | `Você já tentou o número 50 nesta partida. Escolha outro.` |
| 5 | **o juiz compara** com o sorteado | — | `50 é maior que o número sorteado. Tente um número menor.` |

Se passou, o palpite é gravado (201) e, se for o acerto, a partida vira `VENCIDA` com a duração calculada.

```java
public static ResultadoPalpite julgar(int palpite, int numeroSorteado) {
    if (palpite > numeroSorteado) return ResultadoPalpite.MAIOR;
    if (palpite < numeroSorteado) return ResultadoPalpite.MENOR;
    return ResultadoPalpite.ACERTOU;
}
```

### A faixa possível (`Intervalo`)

Cada resposta descarta um lado. A faixa nunca é guardada no banco: ela é **recalculada** a partir dos palpites (uma fonte de verdade só).

```text
[1, 100]  --50 é MAIOR-->  [1, 49]  --25 é MENOR-->  [26, 49]  --37 é MAIOR-->  [26, 36]
```

O front recebe só essa faixa (`partida.possivel`) e pinta o tabuleiro: ciano para o que ainda pode ser, apagado para o que já foi descartado.

Se o jogador chuta **fora** da faixa (ex.: 70 depois de "50 é maior"), o palpite conta, mas o `Narrador` devolve uma **dica**: *"Esse palpite não ajudou: pelas respostas anteriores, o número está entre 1 e 49."* É feedback, um dos critérios do PDF.

### Busca binária: por que 7 tentativas bastam

Chutando sempre o **meio** da faixa possível, cada resposta corta a faixa pela metade:

```text
100 → 50 → 25 → 13 → 7 → 4 → 2 → 1      (7 palpites no pior caso)
```

Para N números, o pior caso da busca binária é **⌊log₂ N⌋ + 1**. Para 100: 2⁶ = 64 ≤ 100 < 128 = 2⁷, então **7**. O cálculo usa só bits:

```java
public static int tentativasIdeais(Intervalo intervalo) {
    int n = intervalo.tamanho();
    return Integer.SIZE - Integer.numberOfLeadingZeros(n);   // floor(log2 n) + 1
}
```

Esse número aparece em três lugares: na tela ("7 no pior caso, jogando no meio"), na **classificação** do jogador e no gráfico de estatísticas.

| Classificação | Regra |
| --- | --- |
| De primeira! | 1 tentativa |
| Excelente | até 7 (o pior caso da busca binária) |
| Bom | de 8 a 10 |
| Pode melhorar | 11 ou mais |

> ⚠️ **Pegadinha clássica de entrevista:** por que `(minimo + maximo) >>> 1` e não `(minimo + maximo) / 2`?
> Porque a soma pode **estourar o `int`** (passar de 2.147.483.647) e virar negativa. O `>>> 1` desloca os bits tratando o número como sem sinal, então dá o meio certo. Esse bug ficou anos na busca binária do próprio JDK e foi corrigido em 2006. Com 1 a 100 ele não aparece, mas há um teste com números perto do limite (`IntervaloTest.meioSemEstouro`).

### A prova: um teste que joga todos os números

`JogadorAutomaticoTest.buscaBinariaNoMaximoSete` faz um robô jogar em busca binária contra **cada um dos 100 números** e confere que o pior caso é exatamente 7:

```java
for (int secreto = 1; secreto <= 100; secreto++) {
    pior = Math.max(pior, jogar(secreto, robo).getTentativas());
}
assertEquals(Desempenho.tentativasIdeais(CEM), pior);   // 7: o limite é atingido, não só respeitado
```

O mesmo arquivo tem um **teste de carga dentro do JUnit**: 100 mil partidas inteiras.

```text
100000 partidas em 0.50 s (média de 6.16 tentativas)
```

(Os números variam conforme a máquina.)

### O sorteio

`Sorteador` é uma interface (padrão **Strategy**). Em produção, `SorteadorAleatorio` usa **`SecureRandom`**: com `java.util.Random` comum, quem visse alguns números sorteados conseguiria prever os próximos. Nos testes, um sorteador "viciado" sempre devolve 42:

```java
private static final Sorteador VICIADO_EM_42 = intervalo -> 42;
```

O gráfico **Números sorteados por faixa** (página Estatísticas) mostra que, com muitas partidas, as dez faixas ficam parecidas: o sorteio não favorece ninguém.

---

## 🔁 Diagrama de estados

![Diagrama de estados da partida](https://joaopauloaramuni.github.io/react-imgs/PalpiteDTI/imgs/diagrama-estados-partida.png)

```mermaid
stateDiagram-v2
    direction LR
    [*] --> EM_ANDAMENTO: POST /api/partidas (número sorteado)
    EM_ANDAMENTO --> EM_ANDAMENTO: palpite MAIOR ou MENOR
    EM_ANDAMENTO --> VENCIDA: palpite ACERTOU
    EM_ANDAMENTO --> ABANDONADA: POST /desistencia
    VENCIDA --> [*]: entra no ranking
    ABANDONADA --> [*]: número revelado
```

| Status | O que significa | O número aparece? | Aceita palpite? |
| --- | --- | :---: | :---: |
| `EM_ANDAMENTO` | rodada aberta | ❌ (`null`) | ✅ |
| `VENCIDA` | o jogador acertou | ✅ | ❌ 409 |
| `ABANDONADA` | o jogador desistiu | ✅ | ❌ 409 |

Os fontes dos diagramas estão em [`docs/diagramas/`](docs/diagramas) (arquivos `.mmd`). Dá para editar em [mermaid.live](https://mermaid.live).

---

## 📁 Estrutura do projeto

Os dois projetos ficam **lado a lado** na mesma pasta: os scripts do `Front` sobem o back-end com `cd ../Back`.

```text
📁 PalpiteDTI
├── 📄 README.md                         ← este arquivo: documentação completa
├── 📄 ROTEIRO.md                        ← como apresentar o projeto na entrevista técnica
├── 📄 LICENSE                           ← licença MIT
├── 📄 .gitignore                        ← arquivos que o Git ignora (IDE, target, node_modules)
├── 🐳 docker-compose.yml                ← sobe MongoDB + Back + Front com um comando
├── ☁️ render.yaml                       ← blueprint de deploy do Back no Render
│
├── 📁 .github/workflows
│   └── ⚙️ ci.yml                        ← GitHub Actions: testes do Back e do Front a cada push
│
├── 📁 docs
│   ├── 📕 Teste dti - Rackers.pdf       ← enunciado do teste (leia antes de rodar!)
│   ├── 🤖 IA.md                         ← onde e como a IA foi usada (exigido pelo PDF)
│   └── 📁 diagramas                     ← fontes Mermaid (.mmd) dos diagramas do README
│       ├── 🧩 componentes.mmd
│       ├── 🌍 implantacao.mmd
│       ├── 🔀 sequencia-palpite.mmd
│       ├── 🔁 estados-partida.mmd
│       └── 🗂️ classes.mmd
│
├── 📁 imgs                              ← capturas de tela e diagramas em PNG (publicados no GitHub Pages)
│
├── 📁 Back                              ← ☕ Spring Boot 4 + MongoDB (porta 8080)
│   ├── 📄 pom.xml                       ← dependências Maven (web, mongodb, validation, actuator, testes, JaCoCo)
│   ├── ⚙️ mvnw / mvnw.cmd               ← Maven Wrapper: baixa o Maven sozinho (Linux-macOS / Windows)
│   ├── 📁 .mvn/wrapper                  ← versão do Maven usada pelo wrapper
│   ├── 🐳 Dockerfile                    ← build em 2 etapas (Maven + JDK 17 -> JRE 17) usado pelo Render
│   ├── 📄 .dockerignore / .gitignore
│   ├── 🧪 requests.http                 ← requisições prontas, inclusive os erros 400/404/409/422
│   ├── 📄 README.md                     ← resumo dos comandos do Back
│   └── 📁 src
│       ├── 📁 main
│       │   ├── 📁 resources
│       │   │   └── ⚙️ application.properties    ← porta, MongoDB, CORS, limites do jogo (1 a 100)
│       │   └── 📁 java/com/dti/palpite
│       │       ├── 🚀 PalpiteApplication.java
│       │       │
│       │       ├── 📁 controller                ← 🎮 portas HTTP (sem regra de jogo)
│       │       │   ├── PartidaController.java    ← POST/GET partidas, POST/GET palpites, desistência
│       │       │   ├── RankingController.java    ← GET /api/ranking?limite=10
│       │       │   ├── EstatisticaController.java ← GET /api/estatisticas
│       │       │   ├── SimulacaoController.java  ← partidas de robôs e reinício do banco
│       │       │   └── StatusController.java     ← /api/status, /api/configuracao e /
│       │       │
│       │       ├── 📁 service                   ← 🧠 orquestração
│       │       │   ├── PartidaService.java       ← sorteia, carrega, chama o Arbitro, grava, esconde o número
│       │       │   ├── RankingService.java       ← top N ordenado no banco e posição de uma partida
│       │       │   ├── EstatisticaService.java   ← indicadores e barras dos gráficos
│       │       │   ├── SimulacaoService.java     ← partidas jogadas por robôs (mesmo Arbitro)
│       │       │   └── StatusService.java        ← ping no MongoDB
│       │       │
│       │       ├── 📁 jogo                      ← 🎲 Java puro (sem Spring): as regras
│       │       │   ├── Arbitro.java              ← aplica as regras de um palpite (409, 422, acerto)
│       │       │   ├── Juiz.java                 ← maior, menor ou acertou
│       │       │   ├── Intervalo.java            ← faixa possível, meio (>>> 1), encolhe a cada resposta
│       │       │   ├── Narrador.java             ← mensagens e dica de palpite desperdiçado
│       │       │   ├── Desempenho.java           ← tentativas ideais (log2) e classificação
│       │       │   ├── Classificacao.java        ← DE_PRIMEIRA, EXCELENTE, BOM, PODE_MELHORAR
│       │       │   ├── Lance.java                ← resultado de registrar um palpite (record)
│       │       │   ├── Sorteador.java            ← interface (Strategy)
│       │       │   ├── SorteadorAleatorio.java   ← SecureRandom, limites inclusivos
│       │       │   └── JogadorAutomatico.java    ← robô: busca binária, intuitiva ou aleatória
│       │       │
│       │       ├── 📁 repository
│       │       │   └── PartidaRepository.java    ← coleção "partidas" (findByStatus paginado, contagens do ranking)
│       │       │
│       │       ├── 📁 model                     ← 🧩 documento do MongoDB e tipos do domínio
│       │       │   ├── Partida.java              ← a rodada, com palpites embutidos e @Version
│       │       │   ├── Palpite.java              ← número, resposta e momento (record)
│       │       │   ├── StatusPartida.java        ← EM_ANDAMENTO, VENCIDA, ABANDONADA
│       │       │   └── ResultadoPalpite.java     ← MAIOR, MENOR, ACERTOU
│       │       │
│       │       ├── 📁 dto                       ← 📦 contrato da API (records)
│       │       │   ├── NovaPartidaRequest.java   ← { "jogador": "Ana" } (opcional, até 30)
│       │       │   ├── PalpiteRequest.java       ← { "numero": 42 } (BigDecimal + @Digits: recusa 42.5)
│       │       │   ├── PartidaResponse.java      ← partida SEM o número enquanto em andamento
│       │       │   ├── PalpiteResponse.java      ← um palpite (ordem, número, resposta)
│       │       │   ├── ResultadoPalpiteResponse.java ← resposta do POST de palpite (mensagem + dica)
│       │       │   ├── IntervaloResponse.java    ← faixa possível
│       │       │   ├── RankingItemResponse.java  ← uma linha do ranking
│       │       │   ├── EstatisticasResponse.java ← indicadores e barras
│       │       │   ├── ConfiguracaoResponse.java ← limites do jogo para o front
│       │       │   ├── SimulacaoResponse.java
│       │       │   └── StatusResponse.java
│       │       │
│       │       ├── 📁 config                    ← ⚙️ configuração
│       │       │   ├── MongoDBProperties.java / MongoConfig.java ← conexão local ou Atlas (timeout de 5 s)
│       │       │   ├── CorsProperties.java / CorsConfig.java     ← libera o Front (e expõe o Location)
│       │       │   ├── JogoProperties.java       ← app.jogo.* (mínimo, máximo, ranking, dados iniciais)
│       │       │   ├── BeansConfig.java          ← Clock, Sorteador (SecureRandom) e Arbitro
│       │       │   └── DadosIniciais.java        ← 30 partidas de robôs se o banco estiver vazio
│       │       │
│       │       └── 📁 exception                 ← 🚨 erros com mensagens claras
│       │           ├── RegraNegocioException.java        ← 422
│       │           ├── ConflitoException.java            ← 409
│       │           ├── RecursoNaoEncontradoException.java ← 404
│       │           ├── ErroResposta.java                 ← formato JSON padrão de erro
│       │           └── GlobalExceptionHandler.java       ← 400/404/405/409/422/503/500
│       │
│       └── 📁 test/java/com/dti/palpite          ← 🧪 JUnit 5 + Mockito + MockMvc
│           ├── 📁 jogo                          ← Java puro, sem mocks
│           │   ├── JuizTest.java                 ← 8 casos parametrizados (pontas 1 e 100)
│           │   ├── IntervaloTest.java            ← encolher, palpite fora da faixa, meio sem estouro
│           │   ├── ArbitroTest.java              ← maior, acerto, repetido, fora da faixa, 409, dica, desistência
│           │   ├── DesempenhoTest.java           ← log2 para vários tamanhos e classificação
│           │   ├── NarradorTest.java             ← textos das mensagens
│           │   ├── SorteadorAleatorioTest.java   ← sempre de 1 a 100, e as pontas saem
│           │   └── JogadorAutomaticoTest.java    ← busca binária ≤ 7 em todos os 100 números + carga de 100 mil
│           ├── 📁 service                       ← Mockito
│           │   ├── PartidaServiceTest.java       ← número escondido, 404, 409, repetido não grava
│           │   ├── RankingServiceTest.java       ← ordem pedida ao banco, posição, limite
│           │   ├── EstatisticaServiceTest.java   ← médias, barras, em andamento fora dos sorteios
│           │   └── SimulacaoServiceTest.java     ← robôs sempre terminam vencendo
│           └── 📁 controller
│               └── PartidaControllerTest.java    ← 201 + Location, 400, 404, 409, 422 (MockMvc)
│
├── 📁 Front                             ← ⚛️ React 19 + Vite 8 (porta 5173)
│   ├── 📄 package.json                  ← dependências (versões fixas) e scripts (dev, build, test, dev:all)
│   ├── 📄 package-lock.json / .npmrc    ← versões exatas; .npmrc contorna um bug do npm 10
│   ├── ⚡ vite.config.js                ← porta 5173 e Vitest
│   ├── 🎨 postcss.config.js             ← Autoprefixer (pós-processador)
│   ├── 📄 index.html                    ← página base (título, favicon, cor do tema)
│   ├── ☁️ vercel.json                   ← rewrite: toda rota volta para o index.html
│   ├── 🐳 Dockerfile / ⚙️ nginx.conf    ← build com Node e site servido pelo nginx
│   ├── 🔐 .env.example                  ← modelo da variável VITE_API_URL
│   ├── 📁 public                        ← logos dti (branco, azul, ciano), favicon
│   └── 📁 src
│       ├── 🚀 main.jsx                  ← fontes Red Hat, estilos globais e BrowserRouter
│       ├── 🧭 App.jsx                   ← rotas, cabeçalho/rodapé e contexto do jogo
│       ├── 📁 styles                    ← 🎨 SCSS do design system
│       │   ├── index.scss                ← entrada: @use de cada partial
│       │   ├── _tokens.scss              ← variáveis CSS (cores, fontes, raios) + mapa de breakpoints
│       │   ├── _mixins.scss              ← ate(tela), foco, pilula, somente-leitor
│       │   ├── _base.scss                ← tipografia, página, grades, painéis
│       │   ├── _componentes.scss         ← botões, campos, mensagens, selos, tabelas, KPIs
│       │   └── _impressao.scss           ← CSS de impressão (Design System -> PDF)
│       ├── 📁 pages
│       │   ├── Jogar.jsx + .scss (+ .test) ← "/": tabuleiro, palpite, histórico, fim de rodada
│       │   ├── Ranking.jsx (+ .test)       ← "/ranking": top 10 salvo no MongoDB
│       │   ├── Estatisticas.jsx + .scss (+ .test) ← "/estatisticas": indicadores e 3 gráficos SVG
│       │   ├── DesignSystem.jsx + .scss    ← "/design": identidade visual em capítulos
│       │   └── NaoEncontrada.jsx           ← 404
│       ├── 📁 components
│       │   ├── 📁 Tabuleiro              ← os 100 números sobre o azul dti (+ .scss, + .test)
│       │   ├── 📁 GraficoBarras          ← gráfico de barras em SVG puro com tabela acessível (+ .test)
│       │   ├── 📁 Layout                 ← Cabecalho, Rodape, Layout.scss
│       │   ├── PalpiteForm.jsx (+ .test)  ← campo do palpite com validação na tela
│       │   ├── NovaPartidaForm.jsx        ← nome (opcional) e "Começar rodada"
│       │   ├── HistoricoPalpites.jsx (+ .test) ← lista ordenada dos palpites
│       │   ├── ResultadoFinal.jsx         ← acerto (com posição no ranking) ou desistência
│       │   ├── Selos.jsx · Kpi.jsx · Mensagem.jsx
│       ├── 📁 services                  ← httpClient.js (+ .test) e api.js (uma função por endpoint)
│       ├── 📁 hooks                     ← usePartida (o jogo), usePolling, JogoContext
│       ├── 📁 config                    ← apiConfig.js (VITE_API_URL) e designSystem.js (tokens do /design)
│       ├── 📁 utils                     ← validacao, formatadores, contraste (WCAG), armazenamento, rotulos (+ testes)
│       └── 📁 test/setup.js             ← jest-dom, limpeza entre testes
│
└── 📁 load-tests                        ← 📈 Grafana k6
    ├── 📄 README.md
    ├── 🧰 comum.js                      ← cada usuário joga uma partida inteira em busca binária
    ├── 💨 smoke.js · 🏋️ carga.js · ⚡ pico.js
    └── 📁 observabilidade               ← Prometheus + Grafana + dashboard "PalpiteDTI - carga"
```

---

## 🌐 Endpoints da API

Base local: `http://localhost:8080`. Todas as requisições prontas para testar estão em [`Back/requests.http`](Back/requests.http) (VS Code com a extensão *REST Client* ou IntelliJ).

| Método | Endpoint | O que faz | Respostas |
| --- | --- | --- | --- |
| `POST` | `/api/partidas` | Nova rodada (corpo opcional `{ "jogador": "Ana" }`) | 201 + `Location` · 400 |
| `GET` | `/api/partidas/{id}` | Estado da partida (número só se encerrada) | 200 · 404 |
| `POST` | `/api/partidas/{id}/palpites` | Registra um palpite `{ "numero": 42 }` | 201 + `Location` · 400 · 404 · 409 · 422 |
| `GET` | `/api/partidas/{id}/palpites` | Histórico de palpites | 200 · 404 |
| `POST` | `/api/partidas/{id}/desistencia` | Desiste e revela o número | 200 · 404 · 409 |
| `GET` | `/api/ranking?limite=10` | Melhores partidas vencidas | 200 · 400 |
| `GET` | `/api/estatisticas` | Indicadores e dados dos gráficos | 200 |
| `GET` | `/api/configuracao` | Limites do jogo (1, 100, 7 tentativas ideais) | 200 |
| `POST` | `/api/simulacao/partidas?quantidade=20` | Partidas jogadas por robôs | 201 · 400 |
| `POST` | `/api/simulacao/reiniciar?partidas=0` | Apaga tudo (e recria N partidas de exemplo) | 200 · 400 |
| `GET` | `/api/status` | A API e o MongoDB estão no ar? | 200 |
| `GET` | `/actuator/prometheus` | Métricas para o Prometheus | 200 |

### Por que as rotas são assim (REST)

- **Substantivos, não verbos:** `/partidas` e `/partidas/{id}/palpites` são **recursos**; a ação é o método HTTP. Nada de `/chutar` ou `/novoJogo`.
- **Hierarquia:** um palpite só existe dentro de uma partida, por isso a rota aninhada.
- **POST cria → 201 Created + `Location`** apontando para o recurso criado (`/api/partidas/{id}`, `/api/partidas/{id}/palpites/{n}`).
- **GET nunca altera nada.** Consultar uma partida não "gasta" tentativa.
- **Desistência é um recurso** (`POST /partidas/{id}/desistencia`), porque `DELETE /partidas/{id}` apagaria a partida, que precisa continuar nas estatísticas.

### Exemplos

```bash
# nova rodada
curl -i -X POST http://localhost:8080/api/partidas \
  -H "Content-Type: application/json" -d '{"jogador":"Ana"}'

# palpite (troque o id)
curl -X POST http://localhost:8080/api/partidas/ID_DA_PARTIDA/palpites \
  -H "Content-Type: application/json" -d '{"numero":50}'
```

Resposta de um palpite (repare: `numeroSecreto` é `null`):

```json
{
  "palpite": { "ordem": 1, "numero": 50, "resultado": "MAIOR", "resultadoRotulo": "Maior que o sorteado", "momento": "..." },
  "mensagem": "50 é maior que o número sorteado. Tente um número menor.",
  "dica": null,
  "partida": {
    "id": "6719f0...", "jogador": "Ana", "status": "EM_ANDAMENTO",
    "intervalo": { "minimo": 1, "maximo": 100, "tamanho": 100 },
    "possivel": { "minimo": 1, "maximo": 49, "tamanho": 49 },
    "tentativas": 1, "tentativasIdeais": 7,
    "numeroSecreto": null,
    "...": "..."
  }
}
```

### Erros claros (critério do PDF)

Todo erro volta no mesmo formato, com uma `mensagem` que pode ir direto para a tela:

```json
{
  "status": 422,
  "erro": "Unprocessable Entity",
  "mensagem": "Você já tentou o número 50 nesta partida. Escolha outro.",
  "caminho": "/api/partidas/6719f0.../palpites",
  "timestamp": "2026-10-26T12:00:05Z",
  "campos": {}
}
```

| Código | Quando | Exemplo de mensagem |
| --- | --- | --- |
| **400** | `numero` faltando | `campos.numero: "Informe o número do palpite."` |
| **400** | `numero` com casas decimais | `O palpite precisa ser um número inteiro, sem casas decimais.` |
| **400** | JSON quebrado | `O corpo da requisição não é um JSON válido. Exemplo: { "numero": 42 }` |
| **400** | nome com mais de 30 caracteres | `campos.jogador: "O nome pode ter no máximo 30 caracteres."` |
| **404** | id não existe | `Partida com id "x" não encontrada.` |
| **409** | palpite em partida encerrada | `Esta partida já terminou (vencida). Comece uma nova rodada para continuar jogando.` |
| **409** | dois palpites ao mesmo tempo (`@Version`) | `Outro palpite foi registrado nesta partida ao mesmo tempo...` |
| **422** | fora de 1 a 100 | `Escolha um número entre 1 e 100. Você enviou 150.` |
| **422** | número repetido | `Você já tentou o número 50 nesta partida. Escolha outro.` |
| **503** | MongoDB fora do ar | `Não foi possível conectar ao MongoDB...` |

> **400 × 422 × 409:** 400 é "não entendi o que você mandou" (formato). 422 é "entendi, mas isso quebra uma regra do jogo". 409 é "o recurso não está num estado que aceite isso". Saber explicar essa diferença conta pontos.

---

## 🚀 Como rodar

### Pré-requisitos

| O quê | Para quê | Como conferir |
| --- | --- | --- |
| **JDK 17** | Rodar o Spring Boot | `java -version` |
| **Node.js 20+** | Rodar o React / Vite | `node -v` |
| **Docker** (recomendado) | MongoDB local ou o projeto inteiro | `docker -v` |
| ou **MongoDB Atlas** | Banco na nuvem | seção [MongoDB Atlas](#-mongodb-atlas) |

> O Maven **não** precisa estar instalado: o back-end usa o **Maven Wrapper** (`mvnw`), que baixa o Maven sozinho na primeira execução.

### Opção 1: tudo com Docker (1 comando) 🐳

```bash
docker compose up --build
```

| Serviço | Endereço |
| --- | --- |
| Front-end | http://localhost:5173 |
| API | http://localhost:8080/api/status |
| MongoDB | `mongodb://localhost:27017` |

### Opção 2: rodando cada parte (para desenvolver)

**1. Banco** (escolha um):

```bash
docker run -d --name mongo-palpite -p 27017:27017 mongo:7    # MongoDB local
```

ou exporte a connection string do Atlas:

```bash
export MONGODB_URI="mongodb+srv://USUARIO:SENHA@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority"   # macOS/Linux
$env:MONGODB_URI="mongodb+srv://..."                                                                        # Windows PowerShell
```

**2. Back-end** (terminal 1):

```bash
cd Back
./mvnw spring-boot:run          # Windows: .\mvnw.cmd spring-boot:run
```

Espere `Tomcat started on port 8080` e abra http://localhost:8080/api/status:

```json
{ "api": "online", "mongodb": "online", "versao": "1.0.0" }
```

Na primeira subida, o `DadosIniciais` cria 30 partidas de exemplo jogadas por robôs.

**3. Front-end** (terminal 2):

```bash
cd Front
npm install                     # só na primeira vez
npm run dev
```

Abra http://localhost:5173, digite seu nome e clique em **Começar rodada**.

### Opção 3: os dois juntos num terminal só (`concurrently`) ⭐

```bash
cd Front
npm install
npm run dev:all                 # macOS / Linux
npm run dev:all:windows         # Windows
```

> Os scripts fazem `cd ../Back`. Por isso `Back` e `Front` precisam ficar **lado a lado**, como neste repositório.

### Configuração (`application.properties`)

Tudo aceita variável de ambiente no formato `${VARIAVEL:valor-padrão}`:

| Variável | Propriedade | Padrão |
| --- | --- | --- |
| `MONGODB_URI` | `app.mongodb.connection-string` | `mongodb://localhost:27017` |
| `MONGODB_DATABASE` | `app.mongodb.database` | `PalpiteDTI` |
| `CORS_ORIGINS` | `app.cors.allowed-origins` | `http://localhost:5173`, Vercel e domínio dti |
| `PORT` | `server.port` | `8080` (o Render injeta a dele) |

Regras do jogo (mude e reinicie para experimentar):

| Propriedade | Padrão | Efeito |
| --- | --- | --- |
| `app.jogo.minimo` / `app.jogo.maximo` | `1` / `100` | Faixa do sorteio. Com `1000`, o pior caso da busca binária vira 10, e a tela se ajusta sozinha |
| `app.jogo.tamanho-ranking` | `10` | Quantas linhas o ranking mostra |
| `app.jogo.popular-ao-iniciar` | `true` | Cria partidas de exemplo se o banco estiver vazio |
| `app.jogo.partidas-iniciais` | `30` | Quantas |

---

## 🍃 MongoDB Atlas

1. Crie uma conta em [mongodb.com/atlas](https://www.mongodb.com/atlas) e um cluster **Free (M0)**, de preferência na região São Paulo.
2. **Security › Database Access › Add New Database User**: método *Password*, permissão *Read and write to any database*. Dica: use senha só com letras e números.
3. **Security › Network Access › Add IP Address › Allow Access from Anywhere** (`0.0.0.0/0`). O Render grátis não tem IP fixo, então isso é necessário para o deploy.
4. **Database › Connect › Drivers › Java**: copie a string e troque `<db_password>` pela senha.
5. Use a string na variável `MONGODB_URI` (local) e no painel do Render (produção).

> ⚠️ Se a senha tiver caracteres especiais, codifique: `@` → `%40`, `:` → `%3A`, `/` → `%2F`, `#` → `%23`.
>
> 🔐 **Nunca** faça commit da senha. Ela fica só em variável de ambiente.

Não precisa criar banco nem coleção: o MongoDB cria `PalpiteDTI` e a coleção `partidas` no primeiro `save`, e o Spring cria o índice do ranking. Para ver os dados: **Database › Browse Collections**.

---

## 🧪 Testes automatizados

### Back-end: JUnit 5 + Mockito + MockMvc

```bash
cd Back
./mvnw test                     # roda tudo
./mvnw test -Dtest=ArbitroTest  # uma classe só
```

O relatório de **cobertura** (JaCoCo) fica em `Back/target/site/jacoco/index.html`.

| Classe de teste | Tipo | O que garante |
| --- | --- | --- |
| `JuizTest` | unitário puro, **parametrizado** | maior, menor e acertou, inclusive nas pontas 1 e 100 |
| `IntervaloTest` | unitário puro | a faixa encolhe; palpite fora da faixa não muda nada; `meio()` sem estouro |
| `ArbitroTest` | unitário puro | maior, acerto (VENCIDA + duração), repetido (422, não conta), fora da faixa (422), encerrada (409), dica, desistência |
| `DesempenhoTest` | unitário puro, parametrizado | ⌊log₂ N⌋ + 1 para 1, 2, 3, 7, 8, 100, 127, 128, 1000; classificação |
| `NarradorTest` | unitário puro | textos exatos das mensagens e da dica |
| `SorteadorAleatorioTest` | unitário puro | 20 mil sorteios sempre de 1 a 100, e as pontas saem |
| `JogadorAutomaticoTest` | unitário + **carga** | busca binária ≤ 7 em **todos** os 100 números; toda estratégia termina; **100 mil partidas** em < 10 s |
| `PartidaServiceTest` | **Mockito** | número escondido na resposta, "Anônimo", 404, 409 e repetido **não gravam nada**, posição no ranking |
| `RankingServiceTest` | **Mockito** | pede ao banco a ordem e o limite certos; posição = quem está na frente + 1 |
| `EstatisticaServiceTest` | **Mockito** | médias, barras, partida em andamento fora dos sorteios, banco vazio sem dividir por zero |
| `SimulacaoServiceTest` | **Mockito** | robôs sempre terminam vencendo e são gravados de uma vez |
| `PartidaControllerTest` | **MockMvc** + Mockito | 201 + `Location`, corpo opcional, 400 (sem número, 42.5, nome longo, JSON quebrado), 404, 409, 422 |

**O que é Mockito, em uma frase:** ele cria **dublês** (mocks) do repository, então o teste do `PartidaService` roda **sem MongoDB**, em milissegundos, testando só a orquestração.

```java
service.palpitar("p1", palpite(50));                          // 1ª gravação

assertThrows(RegraNegocioException.class, () -> service.palpitar("p1", palpite(50)));

assertEquals(1, p.getTentativas());
verify(partidaRepository, times(1)).save(any());              // o repetido não gerou uma 2ª
```

**Truque do sorteador viciado:** como o `Sorteador` é injetado, o teste usa `intervalo -> 42` e sabe a resposta de antemão.

### Front-end: Vitest + Testing Library

```bash
cd Front
npm test                        # roda uma vez
npm run test:watch              # fica observando
```

| Arquivo | O que garante |
| --- | --- |
| `Jogar.test.jsx` | **fluxo completo** com a API mockada: começar, "maior", faixa encolhe, acertar, posição no ranking; erro 422 da API; F5 retoma a rodada; desistir revela o número |
| `PalpiteForm.test.jsx` | vazio, fora da faixa, decimal e repetido **não chamam a API**; envia e limpa; mantém o número se a API recusar; clique no tabuleiro preenche |
| `Tabuleiro.test.jsx` | situação de cada número, 100 casas, resumo em texto, clique só nas possíveis, último palpite marcado |
| `HistoricoPalpites.test.jsx` | lista vazia e ordem do mais recente |
| `Ranking.test.jsx` · `Estatisticas.test.jsx` | tabela, selo de robô, destaque da última vitória, vazio, servidor fora do ar, gráficos |
| `GraficoBarras.test.jsx` | barras, destaque, tabela acessível, topo do eixo |
| `httpClient.test.js` | JSON no POST, `ErroApi` com a mensagem do back-end, servidor fora do ar, 204 |
| `validacao.test.js` · `formatadores.test.js` · `contraste.test.js` | regras do campo, pt-BR, WCAG |

### CI

O [`.github/workflows/ci.yml`](.github/workflows/ci.yml) roda os testes do back (Java 17) e do front, mais o build, em todo `push`. O selo verde na aba **Actions** do GitHub é um ótimo sinal para quem avalia.

---

## 📈 Testes de carga e observabilidade

Ferramenta: **[Grafana k6](https://k6.io)**. Cada usuário virtual joga **partidas inteiras**: cria a partida, chuta o meio da faixa possível até acertar (sem conhecer o número) e consulta ranking e estatísticas. Um `check` confere que nenhuma partida passou de 7 tentativas.

| Script | Cenário | Limites (thresholds) |
| --- | --- | --- |
| `load-tests/smoke.js` | 1 usuário, 30 s | erro < 1%, p95 < 500 ms |
| `load-tests/carga.js` | sobe até **50 usuários**, mantém 2 min | erro < 1%, p95 < 800 ms, palpite p95 < 300 ms |
| `load-tests/pico.js` | **0 → 200 usuários em 10 s** | erro < 5%, p95 < 3 s |

```bash
# instale: https://grafana.com/docs/k6/latest/set-up/install-k6/
k6 run load-tests/smoke.js
k6 run -e API_URL=https://palpite-dti-api.onrender.com load-tests/smoke.js   # contra o deploy
```

> Repare que `GET /api/estatisticas` tende a ser o mais lento: ele lê **todas** as partidas para calcular os indicadores, e o teste de carga cria milhares delas. É um ótimo ponto para discutir na entrevista (aggregation pipeline, cache, tabela de resumo).

### k6 + Prometheus + Grafana

Com a API rodando em `localhost:8080`:

```bash
cd load-tests/observabilidade
docker compose up -d prometheus grafana
docker compose run --rm k6                # roda o carga.js mandando métricas ao Prometheus
```

Abra **http://localhost:3000** (admin/admin) › Dashboards › **PalpiteDTI - carga**: usuários virtuais, req/s, p95 por endpoint e taxa de erro (k6), mais req/s por rota, heap da JVM e CPU (Spring Boot via `/actuator/prometheus`). Ver a latência do k6 **e** a memória da JVM no mesmo gráfico é o que transforma "teste de carga" em **observabilidade**.

---

## 🏆 Ranking e estatísticas

**Ranking** (bônus do PDF: *"placar que mostre um ranking com o nome dos participantes com menor número de tentativas, salvo em banco de dados"*):

- `GET /api/ranking?limite=10` lê do MongoDB só as partidas `VENCIDA`, **ordenadas e limitadas no próprio banco** (índice composto).
- Desempate: menos segundos, depois quem terminou antes.
- Ao acertar, a resposta já traz `posicaoRanking` ("3º lugar no ranking"), calculada com três contagens no banco, sem carregar o ranking inteiro.
- A página destaca a última vitória deste navegador ("você") e marca as partidas de exemplo como "robô".

**Estatísticas** (`/estatisticas`, atualiza a cada 5 s): partidas jogadas, taxa de acerto, média e melhor resultado, % de partidas dentro das 7 tentativas e tempo médio. Três gráficos em **SVG próprio** (sem biblioteca, como o PDF prefere), cada um com uma tabela equivalente para leitores de tela:

| Gráfico | O que conta |
| --- | --- |
| Tentativas até acertar | quantas partidas levaram 1, 2, 3... tentativas, com a linha do limite da busca binária (7) |
| Primeiro palpite mais comum | o 50 costuma ganhar: é o chute que mais informação dá |
| Números sorteados por faixa | 1–10, 11–20...: com muitas partidas, as barras se igualam (o sorteio é justo). Partidas em andamento ficam de fora, para não dar pista |

---

## 🎨 Design system

A página **`/design`** (link no rodapé) documenta a identidade visual contando a história das decisões, no mesmo padrão do DronesDTI, e tem botão **Salvar em PDF**.

| Token | Valor | Uso |
| --- | --- | --- |
| Azul dti | `#000066` | marca, cabeçalho, fundo do tabuleiro |
| Ciano | `#40E6F2` | números ainda possíveis, faixa possível, acerto |
| Laranja | `#FC6D3A` | palpite **maior** que o sorteado (↓) |
| Lilás | `#A9AEFF` | palpite **menor** que o sorteado (↑) |
| Azul elétrico | `#3038D5` | botões, links, foco, barras dos gráficos |
| Papel | `#F4F4F4` | fundo das páginas |
| Fontes | **Red Hat Display** (títulos) + **Red Hat Text** (texto) | via `@fontsource` |

As cores vêm do material do processo seletivo e o logo da dti vem do arquivo oficial (versões branca, azul e ciano em `Front/public/`), os mesmos do DronesDTI. A peça central é o **tabuleiro**: cem círculos (o "pingo" do logo) sobre o azul da marca, que apagam conforme o juiz responde. Cor nunca é a única informação: cada resposta também tem uma seta (↓ ↑ ✓).

### SCSS (pré-processador) + PostCSS (pós-processador)

Os dois são **bônus** do PDF.

- **SCSS:** `src/styles/` tem os *partials* (`_tokens`, `_mixins`, `_base`, `_componentes`, `_impressao`) unidos com `@use`; cada componente tem seu `.scss` ao lado do `.jsx`. Os breakpoints ficam num **mapa Sass** e são usados com o mixin `@include ate(tablet)`.
- **Variáveis CSS para os tokens:** as cores continuam como `--azul-dti` etc., visíveis no DevTools e no JavaScript (a página `/design` calcula o contraste WCAG de cada par na hora).
- **PostCSS + Autoprefixer:** depois do Sass, acrescenta prefixos de navegador só onde a lista `browserslist` do `package.json` ainda precisa.

```scss
// src/styles/_mixins.scss
@mixin ate($tela) {
  @media (max-width: map.get(tokens.$telas, $tela)) { @content; }
}

// src/styles/_base.scss
.grade-2 {
  grid-template-columns: minmax(0, 1.5fr) minmax(320px, 1fr);
  @include ate(tablet) { grid-template-columns: 1fr; }
}
```

### HTML semântico e acessibilidade (critério do PDF)

| Onde | Elementos |
| --- | --- |
| Estrutura | `header` (cabeçalho), `nav` (menu e rodapé), `main`, `section` com `aria-labelledby`, `footer` |
| Palpite | `form` + `label` ligado ao `input`, `aria-invalid` e `aria-describedby` no erro |
| Respostas do juiz | região `aria-live` (o leitor de tela anuncia "50 é maior...") |
| Histórico | `ol` (lista **ordenada**: a ordem dos palpites importa) |
| Ranking | `table` com `caption`, `th scope="col"` e `th scope="row"` no nome |
| Gráficos | `figure` + `figcaption`, `svg role="img"` e uma `table` equivalente escondida |
| Tabuleiro | resumo em texto da faixa possível; os 100 botões ficam fora do Tab (atalho de mouse), sem prender quem usa teclado |

---

## ☁️ Deploy

**Ordem recomendada:** MongoDB Atlas → back-end no Render → front-end no Vercel → liberar o domínio do Vercel no CORS.

### 1. Back-end no Render (Docker)

**Jeito rápido (Blueprint):** no Render, *New › Blueprint* › escolha o repositório. O [`render.yaml`](render.yaml) cria o serviço `palpite-dti-api` e pede o valor de `MONGODB_URI`.

**Jeito manual:** *New › Web Service* › repositório › **Root Directory:** `Back` › **Runtime:** Docker › variáveis:

| Variável | Valor |
| --- | --- |
| `MONGODB_URI` | connection string do Atlas |
| `CORS_ORIGINS` | `https://palpite-dti.vercel.app,https://*.vercel.app,https://palpite.dti.dev` |

Teste: `https://palpite-dti-api.onrender.com/api/status`.

> 💤 O plano grátis "dorme" após 15 min sem acesso. A primeira requisição depois disso demora uns 50 s. O cabeçalho do site mostra "Conectando ao servidor" enquanto isso.

### 2. Front-end no Vercel

*Add New › Project* › repositório › **Root Directory:** `Front` (o Vercel detecta Vite) › **Environment Variables:**

| Variável | Valor |
| --- | --- |
| `VITE_API_URL` | `https://palpite-dti-api.onrender.com` (sem `/` no final) |

**Por que existe o `vercel.json`?** O React Router muda a URL no navegador (`/ranking`), mas não existe arquivo `/ranking` no servidor. O *rewrite* manda toda rota para o `index.html` e o React decide o que mostrar. Sem ele, dar F5 em `/ranking` dá 404. O `nginx.conf` faz o mesmo na imagem Docker.

### 3. Domínio próprio (`palpite.dti.dev`)

| Registro | Nome | Aponta para | Serviço |
| --- | --- | --- | --- |
| `CNAME` | `palpite` | `cname.vercel-dns.com` | front (Vercel › Settings › Domains) |
| `CNAME` | `api.palpite` | `palpite-dti-api.onrender.com` | API (Render › Settings › Custom Domains) |

Depois, troque `VITE_API_URL` para `https://api.palpite.dti.dev` e confira se o domínio está em `CORS_ORIGINS`.

### 4. Entrega do teste (como pede o PDF)

- Repositório **privado** no GitHub (link público pode **desclassificar**).
- Acesso liberado para **`dtirackers@gmail.com`** até a data de entrega.
- Prazo: **5 dias**.
- E-mail para **`caroline.rezende@dtidigital.com.br`** com o link do repositório, formalizando a resposta ao RH.
- O que enviar: **código**, **premissas assumidas**, **decisões de projeto** e **instruções para executar**: as quatro estão neste README.

---

## 🤖 Uso de IA

O PDF exige: *"Você poderá utilizar ferramentas de IA (...), mas para isso precisará explicar onde e como foi utilizado no projeto."* A explicação completa (ferramenta, onde foi usada parte por parte, regras, prompts e o que foi revisado) está em [`docs/IA.md`](docs/IA.md). Usar IA é permitido; o que conta é **entender e conseguir explicar cada decisão** (o [ROTEIRO.md](ROTEIRO.md) ajuda nisso).

---

## 🛠️ Problemas comuns

| Sintoma | Causa provável | Solução |
| --- | --- | --- |
| `"mongodb": "offline"` em `/api/status` | connection string errada ou IP bloqueado no Atlas | confira `MONGODB_URI` e *Network Access* (`0.0.0.0/0`) |
| Erro de **CORS** no console (F12) | origem do front não liberada | inclua a URL em `CORS_ORIGINS`, sem `/` no final |
| Front mostra "Servidor fora do ar" | back-end desligado ou `VITE_API_URL` errado | suba o back; no Vercel, refaça o deploy após mudar a variável |
| `Port 5173 is already in use` | outro Vite aberto | feche o outro terminal (a porta é fixa por causa do CORS) |
| `./mvnw: Permission denied` | Linux/macOS sem permissão de execução | `chmod +x mvnw` |
| `npm install` com `Cannot read properties of null (reading 'edgesOut')` | bug do npm 10 com peer dependencies opcionais | o `Front/.npmrc` já contorna (`legacy-peer-deps=true`); não apague esse arquivo |
| F5 numa rota dá 404 no deploy | faltou o rewrite | confira o `vercel.json` na pasta `Front` |
| "Esta partida já terminou" ao chutar | a partida foi encerrada em outra aba | clique em **Jogar de novo** |
| Ranking só com robôs | partidas de exemplo da primeira subida | `POST /api/simulacao/reiniciar?partidas=0` limpa tudo |

---

## 🔭 Próximos passos

Ideias de evolução, que também são ótimas respostas para "o que você faria com mais tempo?":

- **Aggregation pipeline** no MongoDB para as estatísticas (hoje calculadas em memória).
- **Token por partida** (ou login com Spring Security + JWT): hoje quem tem o id pode chutar na partida.
- **Moderação de nomes** e limite de partidas por IP no ranking.
- **Testes de integração** com Testcontainers (MongoDB real em Docker durante o teste) e **testes E2E** com Playwright.
- **SSE/WebSocket** no ranking, no lugar do polling.
- **Níveis de dificuldade** (1 a 1000, número de tentativas limitado): a configuração já não depende do "100".
- **Swagger/OpenAPI** (springdoc) para documentação interativa da API.

---

## 📚 Para estudar

- Busca binária e o bug do overflow: *"Extra, Extra - Read All About It: Nearly All Binary Searches and Mergesorts are Broken"*, Joshua Bloch (Google Research Blog, 2006).
- REST e status HTTP: [MDN, códigos de status](https://developer.mozilla.org/pt-BR/docs/Web/HTTP/Status) · RFC 9110.
- [Spring Boot](https://spring.io/projects/spring-boot) · [Spring Data MongoDB](https://spring.io/projects/spring-data-mongodb) · [Mockito](https://site.mockito.org) · [Vitest](https://vitest.dev) · [Testing Library](https://testing-library.com) · [Sass](https://sass-lang.com) · [Autoprefixer](https://github.com/postcss/autoprefixer) · [Grafana k6](https://grafana.com/docs/k6/latest/) · [Mermaid](https://mermaid.js.org)

---

## 📄 Licença

MIT. Veja [LICENSE](LICENSE). Marca, logo e cores pertencem à **dti digital** e são usados aqui apenas no contexto do processo seletivo.
