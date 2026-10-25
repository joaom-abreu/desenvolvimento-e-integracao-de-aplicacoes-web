# 🛸 DronesDTI · Simulador de Entregas por Drone

![Java](https://img.shields.io/badge/Java-21-000066?style=for-the-badge&logo=openjdk&logoColor=white) ![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.1-000066?style=for-the-badge&logo=springboot&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB_Atlas-000066?style=for-the-badge&logo=mongodb&logoColor=white) ![React](https://img.shields.io/badge/React-19-000066?style=for-the-badge&logo=react&logoColor=white) ![Vite](https://img.shields.io/badge/Vite-8-000066?style=for-the-badge&logo=vite&logoColor=white) ![JUnit](https://img.shields.io/badge/JUnit_5_+_Mockito-000066?style=for-the-badge&logo=junit5&logoColor=white) ![Vitest](https://img.shields.io/badge/Vitest-000066?style=for-the-badge&logo=vitest&logoColor=white) ![k6](https://img.shields.io/badge/Grafana_k6-000066?style=for-the-badge&logo=k6&logoColor=white) ![Docker](https://img.shields.io/badge/Docker-000066?style=for-the-badge&logo=docker&logoColor=white) ![Vercel](https://img.shields.io/badge/Vercel-000066?style=for-the-badge&logo=vercel&logoColor=white) ![Render](https://img.shields.io/badge/Render-000066?style=for-the-badge&logo=render&logoColor=white)

Solução completa do **case técnico de desenvolvimento da dti digital** (processo seletivo, Enterprise Hakuna): um sistema que recebe pedidos de entrega, **aloca os pacotes nos drones com o menor número de viagens possível**, calcula a **rota de cada viagem (caixeiro viajante)**, desvia de **zonas de exclusão aérea** e simula, em tempo real, os **estados de cada drone** (Idle → Carregando → Em voo → Entregando → Retornando → Idle).

> 📄 **Antes de rodar, leia o enunciado:** [`docs/DTI_Dev.pdf`](docs/DTI_Dev.pdf). Todo este README faz referência às regras de lá. Entender o problema primeiro é exatamente o que o avaliador espera de você.

| Camada | Tecnologia | Onde roda (produção) |
| --- | --- | --- |
| Front-end | React 19 + Vite 8 + React Router + Recharts | Vercel → `drones-dti.vercel.app` |
| Back-end | Spring Boot 4 (Java 21) · API REST | Render (Docker) |
| Banco | MongoDB Atlas (local: MongoDB no Docker) | Atlas M0 (grátis) |
| Testes | JUnit 5 + Mockito + MockMvc · Vitest + Testing Library | GitHub Actions |
| Carga e observabilidade | Grafana k6 + Prometheus + Grafana | Local (docker-compose) |

---

## 🖼️ Capturas de tela

| Centro de operações (mapa ao vivo) | Rotas calculadas pelo algoritmo |
| :---: | :---: |
| ![Operação](https://joaopauloaramuni.github.io/react-imgs/DronesDTI/imgs/Operacao.png) | ![Rotas](https://joaopauloaramuni.github.io/react-imgs/DronesDTI/imgs/Rotas.png) |

| Pedidos: clique no mapa, fila e rastreio | Erro de regra de negócio vindo da API (422) |
| :---: | :---: |
| ![Pedidos](https://joaopauloaramuni.github.io/react-imgs/DronesDTI/imgs/Pedidos.png) | ![Erro de validação](https://joaopauloaramuni.github.io/react-imgs/DronesDTI/imgs/ErroValidacao.png) |

| Dashboard (relatório) | Frota e zonas de exclusão |
| :---: | :---: |
| ![Dashboard](https://joaopauloaramuni.github.io/react-imgs/DronesDTI/imgs/Dashboard.png) | ![Frota](https://joaopauloaramuni.github.io/react-imgs/DronesDTI/imgs/Frota.png) |

| Design system (`/design`) | Mobile |
| :---: | :---: |
| ![Design system](https://joaopauloaramuni.github.io/react-imgs/DronesDTI/imgs/DesignSystem.png) | <img src="https://joaopauloaramuni.github.io/react-imgs/DronesDTI/imgs/Mobile.png" alt="Mobile" width="300"/> |

> As imagens ficam na pasta [`imgs/`](imgs) deste repositório e são servidas pelo GitHub Pages. Para usar no seu fork, publique a pasta no seu GitHub Pages e troque a URL base `https://joaopauloaramuni.github.io/react-imgs/DronesDTI/imgs` (um "localizar e substituir" no README resolve).

---

## 🧭 Sumário

1. [O desafio em 1 minuto](#-o-desafio-em-1-minuto)
2. [Checklist: o que o case pede × onde está](#-checklist-o-que-o-case-pede--onde-está)
3. [Arquitetura (componentes, implantação e sequência)](#️-arquitetura)
4. [Os algoritmos (o coração do case)](#-os-algoritmos)
5. [Diagramas de estados](#-diagramas-de-estados)
6. [Estrutura do projeto](#-estrutura-do-projeto)
7. [Endpoints da API](#-endpoints-da-api)
8. [Como rodar](#-como-rodar)
9. [MongoDB Atlas](#-mongodb-atlas)
10. [Testes automatizados](#-testes-automatizados)
11. [Testes de carga e observabilidade (k6 + Grafana)](#-testes-de-carga-e-observabilidade)
12. [Dashboard](#-dashboard)
13. [Design system](#-design-system)
14. [Deploy (Vercel + Render + domínio)](#️-deploy)
15. [Uso de IA](#-uso-de-ia)
16. [Problemas comuns](#️-problemas-comuns)
17. [Próximos passos](#-próximos-passos)

> 🎤 Vai apresentar este projeto numa entrevista? Leia o [**ROTEIRO.md**](ROTEIRO.md): por onde começar, o que mostrar e as perguntas que costumam aparecer.

---

## 🎯 O desafio em 1 minuto

Uma startup de logística quer testar entregas por drone numa cidade. O sistema precisa:

- receber **pedidos** com localização do cliente **(x, y)**, **peso** e **prioridade** (baixa, média, alta);
- respeitar a **capacidade** de cada drone (**X kg**) e o **alcance por carga de bateria** (**Y km**);
- **alocar os pacotes nos drones com o menor número de viagens possível**.

Neste projeto a cidade é uma **malha 2D de 20 × 20 km**, com a **base dos drones no centro (10, 10)**. Uma **quadra = 100 m**. A simulação roda acelerada: **1 segundo real = 1 minuto simulado**.

| Drone (frota de exemplo) | Capacidade (X) | Alcance por carga (Y) | Velocidade |
| --- | --- | --- | --- |
| Albatroz | 15 kg | 26 km | 45 km/h |
| Falcão | 10 kg | 30 km | 60 km/h |
| Gavião | 8 kg | 28 km | 65 km/h |
| Colibri | 4 kg | 22 km | 80 km/h |

Três **zonas de exclusão aérea** vêm cadastradas: Aeroporto, Hospital (heliponto) e Estádio. Tudo isso é configurável em `application.properties` e pela tela **Frota e zonas**.

---

## ✅ Checklist: o que o case pede × onde está

| O PDF pede | Status | Onde está no código |
| --- | :---: | --- |
| Capacidade X kg e alcance Y km por drone | ✅ | `model/Drone`, validado em `PedidoService` e respeitado em `PlanejadorViagens` |
| Cidade como malha 2D | ✅ | `config/CidadeProperties`, `model/Ponto` |
| Pedido com (x, y), peso e prioridade | ✅ | `dto/PedidoRequest`, `POST /api/pedidos` |
| **Menor número de viagens** | ✅ | `algoritmo/PlanejadorViagens` (semente + preenchimento guloso) |
| Simular bateria (diminui com a distância) | ✅ | `Drone.bateria`, consumo de `100 / alcanceKm` % por km |
| Obstáculos (zonas de exclusão aérea) | ✅ | `algoritmo/MapaAereo` (grafo de visibilidade + Dijkstra) |
| Calcular tempo total de entrega | ✅ | `LinhaDoTempo`, `PedidoResponse.tempoEntregaMin`, Dashboard |
| Fila por prioridade + tempo de chegada | ✅ | `algoritmo/FilaEntregas` (com envelhecimento) |
| Otimização por peso, prioridade e distância | ✅ | critério de escolha do `PlanejadorViagens` |
| Combinações que maximizem capacidade + alcance | ✅ | inserção mais barata + caixeiro viajante |
| Simulação orientada a eventos com estados | ✅ | `SimulacaoService` + `LinhaDoTempo` (timestamps, sem `Thread.sleep`) |
| `POST /pedidos`, `GET /entregas/rota`, `GET /drones/status` | ✅ | `PedidoController`, `EntregaController`, `DroneController` |
| Testes unitários das regras principais | ✅ | `Back/src/test` (JUnit 5 + Mockito) e `Front/src/**/*.test.jsx` |
| Simulação de carga com diversos pedidos | ✅ | teste de 500 pedidos (`PlanejadorViagensTest`) + k6 (`load-tests/`) |
| Rejeitar pacote acima da capacidade, mensagens claras | ✅ | `RegraNegocioException` → 422, `GlobalExceptionHandler` |
| Relatório: entregas, tempo médio, drone mais eficiente, mapa | ✅ | `GET /api/dashboard`, `GET /api/dashboard/mapa-ascii`, página Dashboard |
| Recarga automática com bateria baixa | ✅ | estado `RECARREGANDO` |
| Feedback do cliente ("está a 2 quadras") | ✅ | `GET /api/pedidos/{id}/rastreio` |
| README de como executar | ✅ | este arquivo |
| Entrega via GitHub público | ✅ | ver [Deploy](#️-deploy) |
| (Opcional) Markdown de rules/prompts da IA | ✅ | [`docs/IA.md`](docs/IA.md) |
| (Opcional) Deploy funcionando | ✅ | arquivos prontos: `vercel.json`, `render.yaml`, `Dockerfile`s |

Tecnologias permitidas pelo PDF: Java, JavaScript, Node, React, Angular, C#/.NET. Aqui: **Java (Spring Boot) + JavaScript (React)**.

---

## 🏗️ Arquitetura

### Diagrama de componentes

![Diagrama de componentes](https://joaopauloaramuni.github.io/react-imgs/DronesDTI/imgs/diagrama-componentes.png)

<details>
<summary>Código Mermaid (o GitHub desenha sozinho)</summary>

```mermaid
flowchart LR
    subgraph Navegador["Navegador · React + Vite"]
        P["Páginas<br/>Operação · Pedidos · Rotas<br/>Dashboard · Frota · Design"]
        H["usePolling<br/>(1 a 3 s)"]
        S["services/api.js<br/>httpClient.js"]
        P --> H --> S
    end

    subgraph API["Spring Boot · API REST"]
        C["controller<br/>Pedido · Drone · Zona · Entrega<br/>Dashboard · Simulacao · Status"]
        SV["service<br/>PedidoService · SimulacaoService<br/>EntregaService · DashboardService"]
        AL["algoritmo<br/>FilaEntregas · PlanejadorViagens<br/>CaixeiroViajante · MapaAereo · LinhaDoTempo"]
        R["repository<br/>MongoRepository"]
        T(["@Scheduled tick<br/>a cada 1 s"])
        EX["exception<br/>GlobalExceptionHandler"]
        C --> SV --> AL
        SV --> R
        T --> SV
        C -. erro .-> EX
    end

    DB[("MongoDB<br/>pedidos · drones<br/>viagens · zonas")]
    S -- "HTTP + JSON" --> C
    R --> DB
```
</details>

**A dinâmica entre as partes, em 5 frases:**

1. O **React** nunca calcula nada de negócio: ele mostra e envia. A cada 1 a 3 segundos, o hook `usePolling` pergunta à API "e agora?".
2. O **controller** só traduz HTTP ↔ Java: valida o formato do JSON (`@Valid`) e devolve o status certo (201, 400, 404, 422).
3. O **service** aplica as regras do negócio e orquestra. Quem pensa de verdade é o pacote **algoritmo**, que é **Java puro** (não conhece Spring nem MongoDB) e por isso é fácil de testar.
4. Um **relógio** (`@Scheduled`, 1 vez por segundo) chama o `SimulacaoService`: ele avança as viagens, muda o estado dos drones e despacha novas viagens com a fila de pedidos.
5. O **repository** (Spring Data) guarda pedidos, drones, viagens e zonas no **MongoDB**.

### Camadas do back-end

```text
com.dti.drones
├── DronesApplication   → main (@EnableScheduling liga o relógio da simulação)
├── controller          → porta HTTP: recebe, valida o formato, devolve status
├── dto                 → formato de entrada/saída da API (records Java)
├── service             → regras de negócio + orquestração da simulação
├── algoritmo           → Java puro: fila, planejador, caixeiro viajante, mapa aéreo, linha do tempo
├── repository          → interfaces MongoRepository (o Spring gera a implementação)
├── model               → documentos do MongoDB (Pedido, Drone, Viagem, ZonaExclusao) e enums
├── config              → properties, CORS, conexão com o MongoDB, beans, dados iniciais
└── exception           → exceções de negócio + GlobalExceptionHandler (JSON de erro padronizado)
```

| Pacote | Classes principais | Responsabilidade |
| --- | --- | --- |
| `controller` | `PedidoController`, `DroneController`, `EntregaController`, `ZonaController`, `DashboardController`, `SimulacaoController`, `StatusController` | Endpoints REST |
| `service` | `PedidoService`, `SimulacaoService`, `EntregaService`, `DroneService`, `ZonaService`, `DashboardService`, `MapaService`, `RelogioSimulacao` | Regras e orquestração |
| `algoritmo` | `FilaEntregas`, `PlanejadorViagens`, `CaixeiroViajante`, `MapaAereo`, `LinhaDoTempo` | Otimização (sem Spring) |
| `repository` | `PedidoRepository`, `DroneRepository`, `ViagemRepository`, `ZonaExclusaoRepository` | Acesso ao MongoDB |
| `model` | `Pedido`, `Drone`, `Viagem`, `ZonaExclusao`, `Ponto`, `Parada`, `Fase`, enums | Dados persistidos |
| `dto` | `PedidoRequest/Response`, `DroneRequest/Response`, `ViagemResponse`, `RotasResponse`, `DashboardResponse`... | Contrato da API |
| `config` | `MongoConfig`, `CorsConfig`, `SimulacaoProperties`, `CidadeProperties`, `BeansConfig`, `DadosIniciais` | Configuração |
| `exception` | `RegraNegocioException` (422), `RecursoNaoEncontradoException` (404), `GlobalExceptionHandler` | Erros claros |

### Diagrama de implantação

![Diagrama de implantação](https://joaopauloaramuni.github.io/react-imgs/DronesDTI/imgs/diagrama-implantacao.png)

<details>
<summary>Código Mermaid</summary>

```mermaid
flowchart LR
    U["👩‍💻 Usuário<br/>navegador"]
    subgraph Vercel["Vercel (CDN)"]
        F["React + Vite (dist/)<br/>drones-dti.vercel.app<br/>drones.dti.dev"]
    end
    subgraph Render["Render (Docker)"]
        B["Spring Boot (JAR, Java 21)<br/>drones-dti-api.onrender.com<br/>api.drones.dti.dev"]
    end
    subgraph Atlas["MongoDB Atlas (M0)"]
        M[("DronesDTI")]
    end
    subgraph Obs["Observabilidade (local, docker-compose)"]
        K["k6<br/>testes de carga"]
        PR["Prometheus"]
        G["Grafana"]
    end
    GH["GitHub<br/>repositório público"]

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

### Diagrama de sequência: do pedido à entrega

![Diagrama de sequência](https://joaopauloaramuni.github.io/react-imgs/DronesDTI/imgs/diagrama-sequencia-pedido.png)

<details>
<summary>Código Mermaid</summary>

```mermaid
sequenceDiagram
    autonumber
    actor Cliente
    participant React
    participant Controller as PedidoController
    participant Service as PedidoService
    participant Mongo as MongoDB
    participant Tick as SimulacaoService (tick 1 s)
    participant Alg as PlanejadorViagens + CaixeiroViajante

    Cliente->>React: preenche x, y, peso, prioridade
    React->>Controller: POST /api/pedidos
    Controller->>Service: criar(@Valid PedidoRequest)
    Service->>Service: valida cidade, zona, peso e alcance
    alt regra quebrada
        Service-->>React: 422 { mensagem }
    else ok
        Service->>Mongo: save(Pedido PENDENTE)
        Service-->>React: 201 Created
    end
    loop a cada segundo
        Tick->>Mongo: pendentes + drones IDLE
        Tick->>Alg: planejar(fila, drones, mapa)
        Alg-->>Tick: viagens (pedidos em ordem ótima)
        Tick->>Mongo: Viagem + pedidos ALOCADO + drone CARREGANDO
    end
    React->>Controller: GET /api/pedidos/{id}/rastreio
    Controller-->>React: "Seu pacote está a 2 quadras de distância"
```
</details>

### Modelo de dados

![Diagrama de classes](https://joaopauloaramuni.github.io/react-imgs/DronesDTI/imgs/diagrama-classes.png)

Uma **Viagem** guarda tudo o que o drone vai fazer: as **paradas** na ordem do caixeiro viajante, o **caminho** com os desvios e as **fases** (a linha do tempo de estados). Como um documento do MongoDB, isso fica junto, num documento só, e é lido de uma vez.

---

## 🧠 Os algoritmos

### O problema por trás do case

"Alocar pacotes com o menor número de viagens respeitando peso e distância" é a junção de dois problemas clássicos da computação, ambos **NP-difíceis** (não se conhece algoritmo rápido que garanta o ótimo para entradas grandes):

| Problema clássico | No case | Como resolvemos |
| --- | --- | --- |
| **Bin Packing** (empacotamento) | encher drones (caixas de X kg) com pacotes | heurística gulosa "semente + preenchimento" |
| **Caixeiro Viajante** (TSP) | a rota de cada viagem precisa caber em Y km | exato (até 8 paradas) ou vizinho mais próximo + 2-opt |
| **Menor caminho com obstáculos** | desviar das zonas de exclusão | grafo de visibilidade + Dijkstra |

> 💡 Na entrevista, dizer "isso é um bin packing com restrição de TSP, que é NP-difícil, então usei uma heurística e medi a qualidade" mostra maturidade. Não existe resposta perfeita, existe **decisão justificada**.

### 1. Fila de entregas: prioridade + chegada + envelhecimento (`FilaEntregas`)

1. Ordena por **nível de prioridade** (alta = 3, média = 2, baixa = 1).
2. Empatou? Sai antes **quem chegou antes**.
3. **Envelhecimento (aging):** a cada 30 minutos simulados na fila, o pedido sobe um nível. Assim um pedido de prioridade baixa nunca espera para sempre (o problema da *inanição*, que você estuda em Sistemas Operacionais).

Na tela **Pedidos** dá para ver: `Alta (era Baixa)`.

### 2. Planejador: semente + preenchimento (`PlanejadorViagens`)

Para cada drone livre (os de maior capacidade primeiro):

1. **Semente:** pega o **primeiro pedido da fila** que cabe sozinho no drone (peso ≤ X e ida e volta ≤ alcance da bateria atual). Isso garante que a **prioridade é respeitada**.
2. **Preenchimento:** enquanto houver espaço, adiciona o pedido que:
   - ainda cabe no **peso**;
   - mantém a rota dentro do **alcance**, estimando o km extra pela **inserção mais barata** (onde encaixar o novo ponto na rota para aumentar o mínimo);
   - tem a **maior prioridade** e, empatando, o **melhor aproveitamento** = `kg / km extra`. Pacote pesado "no caminho" é o melhor candidato.
3. **Rota final:** o **caixeiro viajante** reordena as paradas. Como a inserção mais barata é um limite superior da rota ótima, a rota final nunca fica maior que a estimada: continua dentro do alcance.

O endpoint `GET /api/entregas/rota` mostra também o **mínimo teórico** de viagens só pelo peso: `⌈peso total / maior capacidade⌉`. Ele é um limite inferior: se o planejador chega perto dele, está bom. Quando fica longe, normalmente o culpado é o **alcance** (clientes em lados opostos da cidade não cabem na mesma viagem), não o peso.

### 3. Caixeiro viajante (`CaixeiroViajante`)

Dados a base e N clientes, em que ordem visitar para voar a menor distância? Existem **N!** ordens: 8 clientes = 40.320 ordens; 15 clientes = 1,3 trilhão.

| N paradas | Estratégia | Garante o ótimo? | Complexidade |
| --- | --- | :---: | --- |
| 0 ou 1 | trivial | ✅ | O(1) |
| 2 a 8 | **backtracking recursivo com poda** (branch and bound) | ✅ | O(N!) no pior caso, bem menos com poda |
| 9+ | **vizinho mais próximo (recursão em cauda) + 2-opt** | ❌ (aproximado) | O(N²) + O(N²) por rodada do 2-opt |

#### Recursão em cauda (tail recursion)

O vizinho mais próximo foi escrito com **recursão em cauda**: a chamada recursiva é a **última coisa** que o método faz, e o resultado vai sendo carregado num **acumulador**.

```java
static List<Integer> vizinhoMaisProximo(double[][] d, int atual, Set<Integer> restantes, List<Integer> acumulado) {
    if (restantes.isEmpty()) {
        return acumulado;                                  // caso base
    }
    int maisProximo = restantes.stream()
            .min(Comparator.comparingDouble(i -> d[atual][i]))
            .orElseThrow();
    restantes.remove(maisProximo);
    acumulado.add(maisProximo);
    return vizinhoMaisProximo(d, maisProximo, restantes, acumulado);   // chamada em cauda
}
```

O custo do circuito também é recursivo em cauda:

```java
private static double custoDoCircuito(double[][] d, List<Integer> ordem, int i, int anterior, double acumulado) {
    if (i == ordem.size()) return acumulado + d[anterior][0];                       // volta para a base
    int atual = ordem.get(i);
    return custoDoCircuito(d, ordem, i + 1, atual, acumulado + d[anterior][atual]); // em cauda
}
```

> ⚠️ **Pegadinha clássica de entrevista:** a **JVM não faz otimização de chamada em cauda (TCO)**. Scala (`@tailrec`) e Kotlin (`tailrec`) convertem a recursão em laço na compilação; Java não. Cada chamada ainda ocupa um quadro da pilha. Aqui isso não é problema porque a profundidade é o número de paradas de **uma** viagem (no máximo 10). Há um teste com **1.000 paradas** (`recursaoProfunda`) para mostrar que não estoura a pilha nesse tamanho.
>
> A vantagem de escrever em cauda é que a conversão para laço é **mecânica**: os parâmetros viram variáveis e a chamada recursiva vira "atualize as variáveis e repita":
>
> ```java
> while (!restantes.isEmpty()) {
>     int maisProximo = /* mesmo cálculo */;
>     restantes.remove(maisProximo);
>     acumulado.add(maisProximo);
>     atual = maisProximo;          // era o argumento da chamada recursiva
> }
> return acumulado;
> ```

O **backtracking exato** também é recursivo, mas **não é em cauda**: depois de voltar da chamada ele ainda precisa desfazer a escolha (`visitado[prox] = false`) e testar o próximo candidato. A **poda** abandona qualquer caminho parcial que já custa mais que a melhor rota conhecida. A melhor rota inicial vem da heurística, o que deixa a poda muito mais eficiente.

#### 2-opt

Se a rota tem um "X" (duas arestas que se cruzam), inverter o trecho entre elas sempre encurta a rota. O 2-opt testa todos os pares de arestas e repete até não melhorar mais.

### 4. Zonas de exclusão aérea (`MapaAereo`)

1. Se a linha reta A → B não atravessa nenhuma zona, o caminho é ela. O teste usa o algoritmo de recorte **Liang-Barsky**.
2. Se atravessa, monta um **grafo de visibilidade**: os nós são A, B e os 4 cantos de cada zona, afastados 50 m para o drone não raspar na borda. Dois nós se ligam quando a linha reta entre eles está livre.
3. O **Dijkstra** acha o menor caminho nesse grafo, que é o menor desvio possível ao redor dos retângulos.

Os trajetos ficam em **cache** e o caixeiro viajante recebe esse "medidor de distância" sem saber se há obstáculos (interface `MedidorDistancia`, o padrão *Strategy*).

### 5. Linha do tempo e bateria (`LinhaDoTempo`)

Ao despachar, a viagem inteira já é calculada como uma **linha do tempo**:

```text
CARREGANDO | EM_VOO | ENTREGANDO | EM_VOO | ENTREGANDO | RETORNANDO
0 ------- 2 ----- 7,5 ------- 8,5 ---- 12 ------- 13 ---------- 20  (minutos simulados)
```

Saber o que o drone está fazendo "agora" é só ver em qual fase cai o minuto atual. A **posição** é interpolada no caminho e a **bateria** cai `100 / alcanceKm` % por km voado. É uma simulação **orientada a eventos baseada em timestamps**: nada de `Thread.sleep`, então ela funciona igual com 1 ou 1.000 drones e sobrevive a um restart (o estado está no banco).

### Resultados medidos

Do teste `PlanejadorViagensTest.cargaComQuinhentosPedidos` (500 pedidos aleatórios, frota de 4 drones):

```text
500 pedidos -> 119 viagens (mínimo teórico pelo peso: 72) em 0.89 s
```

- Todos os 500 pedidos alocados, **nenhuma** viagem passou do peso nem do alcance.
- A diferença para o mínimo teórico vem do **alcance**: o mínimo só olha o peso.
- Os números variam conforme a máquina.

---

## 🔁 Diagramas de estados

### Drone (a máquina de estados do case)

![Diagrama de estados do drone](https://joaopauloaramuni.github.io/react-imgs/DronesDTI/imgs/diagrama-estados-drone.png)

```mermaid
stateDiagram-v2
    direction LR
    [*] --> IDLE
    IDLE --> CARREGANDO: despacho (fila + planejador)
    CARREGANDO --> EM_VOO: pacotes a bordo (2 min)
    EM_VOO --> ENTREGANDO: chegou no cliente
    ENTREGANDO --> EM_VOO: ainda há pacotes
    ENTREGANDO --> RETORNANDO: última entrega
    RETORNANDO --> IDLE: bateria >= 30%
    RETORNANDO --> RECARREGANDO: bateria < 30%
    IDLE --> RECARREGANDO: fila não cabe na bateria atual
    RECARREGANDO --> IDLE: bateria 100%
```

| Estado | O que acontece | Quem muda |
| --- | --- | --- |
| `IDLE` | Parado na base, esperando pedidos | `SimulacaoService.despacharInterno` |
| `CARREGANDO` | Pacotes sendo colocados (2 min) | linha do tempo |
| `EM_VOO` | Voando até o próximo cliente | linha do tempo |
| `ENTREGANDO` | Parado no cliente (1 min) | linha do tempo |
| `RETORNANDO` | Voltando para a base | linha do tempo |
| `RECARREGANDO` | Na estação de recarga (5% por minuto) | `concluirViagem` / `atualizarRecarga` |

### Pedido

![Diagrama de estados do pedido](https://joaopauloaramuni.github.io/react-imgs/DronesDTI/imgs/diagrama-estados-pedido.png)

```mermaid
stateDiagram-v2
    direction LR
    [*] --> PENDENTE: POST /api/pedidos (validado)
    PENDENTE --> CANCELADO: DELETE /api/pedidos/{id}
    PENDENTE --> ALOCADO: entrou numa viagem
    ALOCADO --> EM_ROTA: drone decolou
    EM_ROTA --> ENTREGUE: drone chegou + 1 min
    ENTREGUE --> [*]
    CANCELADO --> [*]
```

Os fontes dos diagramas estão em [`docs/diagramas/`](docs/diagramas) (arquivos `.mmd`). Dá para editar em [mermaid.live](https://mermaid.live).

---

## 📁 Estrutura do projeto

Os dois projetos ficam **lado a lado** na mesma pasta: os scripts do `Front` sobem o back-end com `cd ../Back`.

```text
📁 DronesDTI
├── 📄 README.md                         ← este arquivo: documentação completa
├── 📄 ROTEIRO.md                        ← como apresentar o projeto na entrevista técnica
├── 📄 LICENSE                           ← licença MIT
├── 📄 .gitignore                        ← arquivos que o Git ignora (IDE, logs)
├── 🐳 docker-compose.yml                ← sobe MongoDB + Back + Front com um comando
├── ☁️ render.yaml                       ← blueprint de deploy do Back no Render
│
├── 📁 .github
│   └── 📁 workflows
│       └── ⚙️ ci.yml                    ← GitHub Actions: roda os testes do Back e do Front a cada push
│
├── 📁 docs
│   ├── 📕 DTI_Dev.pdf                   ← enunciado do case (leia antes de rodar!)
│   ├── 🤖 IA.md                         ← rules, memórias e prompts usados com IA (entregável opcional)
│   └── 📁 diagramas                     ← fontes Mermaid (.mmd) dos diagramas do README
│       ├── 🔁 estados-drone.mmd         ← máquina de estados do drone
│       ├── 🔁 estados-pedido.mmd        ← ciclo de vida do pedido
│       ├── 🧩 componentes.mmd           ← diagrama de componentes
│       ├── 🌍 implantacao.mmd           ← diagrama de implantação (Vercel, Render, Atlas)
│       ├── 🔀 sequencia-pedido.mmd      ← do POST do pedido até a entrega
│       └── 🗂️ classes.mmd               ← modelo de dados
│
├── 📁 imgs                              ← capturas de tela e diagramas em PNG (publicados no GitHub Pages)
│
├── 📁 Back                              ← ☕ Spring Boot 4 + MongoDB (porta 8080)
│   ├── 📄 pom.xml                       ← dependências Maven (web, mongodb, validation, actuator, testes, JaCoCo)
│   ├── ⚙️ mvnw / mvnw.cmd               ← Maven Wrapper: baixa o Maven sozinho (Linux-macOS / Windows)
│   ├── 📁 .mvn/wrapper                  ← versão do Maven usada pelo wrapper
│   ├── 🐳 Dockerfile                    ← build em 2 etapas (Maven -> JRE 21) usado pelo Render
│   ├── 📄 .dockerignore / .gitignore    ← o que não vai para a imagem / para o Git
│   ├── 🧪 requests.http                 ← requisições prontas (REST Client / IntelliJ)
│   ├── 📄 README.md                     ← resumo dos comandos do Back
│   └── 📁 src
│       ├── 📁 main
│       │   ├── 📁 resources
│       │   │   └── ⚙️ application.properties    ← porta, MongoDB, CORS, cidade e parâmetros da simulação
│       │   └── 📁 java/com/dti/drones
│       │       ├── 🚀 DronesApplication.java    ← main; liga o agendador (@EnableScheduling)
│       │       │
│       │       ├── 📁 controller                ← 🎮 portas HTTP (sem regra de negócio)
│       │       │   ├── PedidoController.java     ← POST/GET/DELETE /api/pedidos, fila e rastreio
│       │       │   ├── DroneController.java      ← GET /api/drones/status, cadastro e remoção
│       │       │   ├── EntregaController.java    ← GET /api/entregas/rota (no ar + prévia) e histórico
│       │       │   ├── ZonaController.java       ← CRUD de zonas de exclusão aérea
│       │       │   ├── DashboardController.java  ← indicadores, mapa ASCII e CSV
│       │       │   ├── SimulacaoController.java  ← relógio, despachar, pedidos aleatórios, reiniciar
│       │       │   └── StatusController.java     ← GET /api/status (API + ping no MongoDB)
│       │       │
│       │       ├── 📁 service                   ← 🧠 regras de negócio e orquestração
│       │       │   ├── PedidoService.java        ← valida pedido (peso, alcance, zona, cidade), fila e rastreio
│       │       │   ├── SimulacaoService.java     ← o "motor": tick de 1 s, estados, bateria, recarga e despacho
│       │       │   ├── EntregaService.java       ← monta rotas em andamento e a prévia do planejamento
│       │       │   ├── DroneService.java         ← cadastro da frota e status em tempo real (carga, progresso)
│       │       │   ├── ZonaService.java          ← valida e grava zonas de exclusão
│       │       │   ├── DashboardService.java     ← indicadores, ranking, mapa ASCII e CSV
│       │       │   ├── MapaService.java          ← cache do MapaAereo (recriado quando uma zona muda)
│       │       │   ├── RelogioSimulacao.java     ← converte tempo real em tempo simulado
│       │       │   └── StatusService.java        ← ping no MongoDB
│       │       │
│       │       ├── 📁 algoritmo                 ← 🧮 Java puro (sem Spring): o coração do case
│       │       │   ├── PlanejadorViagens.java    ← semente + preenchimento: menor número de viagens
│       │       │   ├── CaixeiroViajante.java     ← TSP exato (backtracking) e vizinho mais próximo em recursão em cauda + 2-opt
│       │       │   ├── FilaEntregas.java         ← fila por prioridade + chegada, com envelhecimento
│       │       │   ├── MapaAereo.java            ← desvio de zonas: grafo de visibilidade + Dijkstra
│       │       │   ├── LinhaDoTempo.java         ← fases da viagem (estados), posição e km voados
│       │       │   └── MedidorDistancia.java     ← interface: linha reta ou com desvios (Strategy)
│       │       │
│       │       ├── 📁 repository                ← 🗄️ acesso ao MongoDB (Spring Data gera a implementação)
│       │       │   ├── PedidoRepository.java     ← coleção "pedidos" (findByStatus, findByViagemId...)
│       │       │   ├── DroneRepository.java      ← coleção "drones" (findByEstado...)
│       │       │   ├── ViagemRepository.java     ← coleção "viagens"
│       │       │   └── ZonaExclusaoRepository.java ← coleção "zonas"
│       │       │
│       │       ├── 📁 model                     ← 🧩 documentos do MongoDB e tipos do domínio
│       │       │   ├── Pedido.java               ← cliente, (x, y), peso, prioridade, status e horários
│       │       │   ├── Drone.java                ← X kg, Y km, velocidade, bateria, estado, posição e estatísticas
│       │       │   ├── Viagem.java               ← paradas, caminho com desvios e fases de uma viagem
│       │       │   ├── ZonaExclusao.java         ← retângulo onde não se pode voar
│       │       │   ├── Ponto.java                ← coordenada (x, y) em km (record)
│       │       │   ├── Parada.java               ← uma entrega dentro da viagem, com km e minuto previstos (record)
│       │       │   ├── Fase.java                 ← trecho da linha do tempo: estado, início e fim (record)
│       │       │   ├── EstadoDrone.java          ← IDLE, CARREGANDO, EM_VOO, ENTREGANDO, RETORNANDO, RECARREGANDO
│       │       │   ├── StatusPedido.java         ← PENDENTE, ALOCADO, EM_ROTA, ENTREGUE, CANCELADO
│       │       │   ├── StatusViagem.java         ← EM_ANDAMENTO, CONCLUIDA
│       │       │   └── Prioridade.java           ← BAIXA, MEDIA, ALTA (aceita "média", "Alta"...)
│       │       │
│       │       ├── 📁 dto                       ← 📦 contrato da API (records de entrada e saída)
│       │       │   ├── PedidoRequest.java        ← corpo do POST /api/pedidos, com @Valid
│       │       │   ├── PedidoResponse.java       ← pedido devolvido pela API (com tempo de entrega)
│       │       │   ├── FilaItemResponse.java     ← posição na fila e prioridade efetiva
│       │       │   ├── RastreioResponse.java     ← "Seu pacote está a 2 quadras de distância"
│       │       │   ├── DroneRequest.java         ← corpo do POST /api/drones
│       │       │   ├── DroneResponse.java        ← status do drone (bateria, carga, progresso)
│       │       │   ├── ZonaRequest.java          ← corpo do POST /api/zonas
│       │       │   ├── ZonaResponse.java         ← zona devolvida pela API
│       │       │   ├── ViagemResponse.java       ← viagem com rota completa para desenhar no mapa
│       │       │   ├── RotasResponse.java        ← resposta do GET /api/entregas/rota
│       │       │   ├── DashboardResponse.java    ← indicadores do relatório
│       │       │   ├── SimulacaoStatusResponse.java ← relógio, tamanho da cidade e base
│       │       │   ├── StatusResponse.java       ← API e MongoDB online/offline
│       │       │   └── Numeros.java              ← arredondamento dos números da resposta
│       │       │
│       │       ├── 📁 config                    ← ⚙️ configuração
│       │       │   ├── MongoDBProperties.java    ← lê app.mongodb.* (connection string e banco)
│       │       │   ├── MongoConfig.java          ← conecta ao MongoDB local ou Atlas (timeout de 5 s)
│       │       │   ├── CorsProperties.java       ← lê app.cors.allowed-origins
│       │       │   ├── CorsConfig.java           ← libera o Front (localhost:5173, Vercel, domínios dti)
│       │       │   ├── CidadeProperties.java     ← tamanho da malha, base e metros por quadra
│       │       │   ├── SimulacaoProperties.java  ← fator de tempo, recarga, envelhecimento, limites do TSP
│       │       │   ├── BeansConfig.java          ← beans do Clock e do PlanejadorViagens
│       │       │   └── DadosIniciais.java        ← cria frota e zonas de exemplo se o banco estiver vazio
│       │       │
│       │       └── 📁 exception                 ← 🚨 erros com mensagens claras
│       │           ├── RegraNegocioException.java        ← 422: regra de negócio quebrada
│       │           ├── RecursoNaoEncontradoException.java ← 404: id não existe
│       │           ├── ErroResposta.java                 ← formato JSON padrão de erro
│       │           └── GlobalExceptionHandler.java       ← transforma exceções em 400/404/405/422/503/500
│       │
│       └── 📁 test/java/com/dti/drones          ← 🧪 JUnit 5 + Mockito + MockMvc
│           ├── 📁 algoritmo
│           │   ├── CaixeiroViajanteTest.java     ← exato = força bruta, 2-opt, recursão com 1.000 paradas
│           │   ├── PlanejadorViagensTest.java    ← peso, alcance, prioridade, bateria e carga com 500 pedidos
│           │   ├── MapaAereoTest.java            ← desvio de zona, ponto bloqueado, voo rente à borda
│           │   ├── FilaEntregasTest.java         ← ordem da fila e envelhecimento
│           │   └── LinhaDoTempoTest.java         ← ciclo de estados, duração e posição
│           ├── 📁 service
│           │   ├── PedidoServiceTest.java        ← validações com mocks e rastreio "2 quadras"
│           │   ├── SimulacaoServiceTest.java     ← máquina de estados com relógio controlado
│           │   └── DashboardServiceTest.java     ← tempo médio, drone mais eficiente, mapa ASCII
│           └── 📁 controller
│               └── PedidoControllerTest.java     ← códigos HTTP 201, 400, 422 e 404 (MockMvc)
│
├── 📁 Front                             ← ⚛️ React 19 + Vite 8 (porta 5173)
│   ├── 📄 package.json                  ← dependências e scripts (dev, build, test, dev:all)
│   ├── 📄 package-lock.json             ← versões exatas instaladas
│   ├── ⚡ vite.config.js                ← porta fixa 5173 e configuração do Vitest
│   ├── 📄 index.html                    ← página base (título, favicon, cor do tema)
│   ├── ☁️ vercel.json                   ← rewrite: toda rota volta para o index.html (React Router)
│   ├── 🐳 Dockerfile                    ← build com Node e site servido pelo nginx
│   ├── ⚙️ nginx.conf                    ← fallback de SPA e cache dos assets
│   ├── 🔐 .env.example                  ← modelo da variável VITE_API_URL
│   ├── 📄 .dockerignore / .gitignore    ← o que não vai para a imagem / para o Git
│   ├── 📄 README.md                     ← resumo dos comandos e rotas do Front
│   ├── 📁 public                        ← arquivos servidos como estão
│   │   ├── 🖼️ dti-logo-branco.png       ← logo dti para fundo azul (cabeçalho)
│   │   ├── 🖼️ dti-logo-azul.png         ← logo dti para fundo claro (rodapé)
│   │   ├── 🖼️ dti-logo-ciano.png        ← logo dti em destaque (design system)
│   │   ├── 🖼️ dti-icone.png             ← ícone quadrado original
│   │   └── 🖼️ favicon.png / apple-touch-icon.png ← ícones da aba e do celular
│   └── 📁 src
│       ├── 🚀 main.jsx                  ← entrada: fontes Red Hat, CSS global e BrowserRouter
│       ├── 🧭 App.jsx                   ← rotas, cabeçalho/rodapé e contexto da simulação
│       ├── 🎨 index.css                 ← tokens do design system (cores, fontes, raios) e estilos base
│       │
│       ├── 📁 pages                     ← 📄 uma página por rota
│       │   ├── Operacao.jsx              ← "/": mapa ao vivo, KPIs, frota e botões da simulação
│       │   ├── Pedidos.jsx               ← "/pedidos": novo pedido (clique no mapa), fila, lista e rastreio
│       │   ├── Rotas.jsx + Rotas.css     ← "/rotas": viagens no ar e prévia do algoritmo
│       │   ├── Dashboard.jsx + .css      ← "/dashboard": indicadores e gráficos (Recharts) + mapa ASCII
│       │   ├── Frota.jsx                 ← "/frota": cadastro de drones e de zonas de exclusão
│       │   ├── DesignSystem.jsx + .css   ← "/design": identidade visual contada em capítulos (Salvar em PDF)
│       │   ├── NaoEncontrada.jsx         ← página 404
│       │   └── Dashboard.test.jsx        ← teste da página com a API mockada
│       │
│       ├── 📁 components                ← 🧱 peças reutilizáveis
│       │   ├── 📁 MapaAereo
│       │   │   ├── MapaAereo.jsx         ← espaço aéreo em SVG: zonas, rotas, pedidos e drones animados
│       │   │   ├── MapaAereo.css         ← estilos do mapa (azul dti + ciano)
│       │   │   └── MapaAereo.test.jsx    ← acessibilidade, desenho e eixo y invertido
│       │   ├── 📁 Layout
│       │   │   ├── Cabecalho.jsx         ← logo, menu e status do servidor
│       │   │   ├── Rodape.jsx            ← rodapé com link para o design system
│       │   │   └── Layout.css            ← estilos de cabeçalho e rodapé
│       │   ├── PedidoForm.jsx            ← formulário de pedido com validação na tela
│       │   ├── PedidoForm.test.jsx       ← campos, vírgula decimal, erro 422 e clique no mapa
│       │   ├── DroneLista.jsx + .css     ← cartões de drone (estado, bateria, carga, progresso)
│       │   ├── DroneLista.test.jsx       ← estado, carga e bateria baixa
│       │   ├── ViagemCartao.jsx          ← uma viagem: ocupação, distância, algoritmo e paradas
│       │   ├── Bateria.jsx               ← barra de bateria (verde, âmbar, vermelha)
│       │   ├── Selos.jsx                 ← selos de estado, prioridade e status
│       │   ├── Kpi.jsx                   ← cartão de indicador
│       │   └── Mensagem.jsx              ← caixa de sucesso, erro ou informação
│       │
│       ├── 📁 services                  ← 🔌 conversa com o Back
│       │   ├── httpClient.js             ← fetch + tratamento de erro único (ErroApi)
│       │   ├── httpClient.test.js        ← sucesso, 422, servidor fora do ar e 204
│       │   └── api.js                    ← uma função por endpoint (pedidos, drones, zonas, rotas...)
│       │
│       ├── 📁 hooks                     ← 🪝 lógica reaproveitável
│       │   ├── usePolling.js             ← busca de tempos em tempos (acompanha a simulação)
│       │   └── SimulacaoContext.jsx      ← tamanho da cidade e status da API para todas as páginas
│       │
│       ├── 📁 config
│       │   ├── apiConfig.js              ← URL do Back (VITE_API_URL ou localhost:8080)
│       │   └── designSystem.js           ← tokens documentados na página /design
│       │
│       ├── 📁 utils
│       │   ├── formatadores.js (+ .test) ← km, kg, minutos e porcentagem em pt-BR
│       │   ├── contraste.js (+ .test)    ← contraste WCAG 2.1 entre duas cores
│       │   └── rotulos.js                ← textos e cores de estados, status e prioridades
│       │
│       └── 📁 test
│           └── setup.js                  ← configuração do Vitest (jest-dom, ResizeObserver)
│
└── 📁 load-tests                        ← 📈 Grafana k6
    ├── 📄 README.md                     ← como rodar os testes de carga
    ├── 🧰 comum.js                      ← gera pedidos válidos e consulta o painel (usado pelos 3 cenários)
    ├── 💨 smoke.js                      ← 1 usuário por 30 s
    ├── 🏋️ carga.js                      ← até 50 usuários simultâneos
    ├── ⚡ pico.js                        ← 0 a 200 usuários em 10 s
    └── 📁 observabilidade
        ├── 🐳 docker-compose.yml        ← Prometheus + Grafana + k6
        ├── ⚙️ prometheus.yml            ← coleta /actuator/prometheus do Back
        └── 📁 grafana/provisioning      ← datasource e dashboard "DronesDTI - carga" prontos
```

---

## 🌐 Endpoints da API

Base local: `http://localhost:8080`. Todas as requisições prontas para testar estão em [`Back/requests.http`](Back/requests.http) (VS Code com a extensão *REST Client* ou IntelliJ).

| Método | Endpoint | O que faz | Respostas |
| --- | --- | --- | --- |
| `POST` | `/api/pedidos` | Cria um pedido (entra na fila) | 201 · 400 · 422 |
| `GET` | `/api/pedidos?status=` | Lista pedidos (filtro opcional) | 200 |
| `GET` | `/api/pedidos/fila` | Pendentes na ordem de atendimento | 200 |
| `GET` | `/api/pedidos/{id}` | Um pedido | 200 · 404 |
| `GET` | `/api/pedidos/{id}/rastreio` | "Seu pacote está a 2 quadras de distância" | 200 · 404 |
| `DELETE` | `/api/pedidos/{id}` | Cancela (só se ainda estiver na fila) | 200 · 404 · 422 |
| `GET` | `/api/drones/status` | Estado, bateria, posição, carga e progresso | 200 |
| `POST` | `/api/drones` | Cadastra drone (X kg, Y km) | 201 · 400 · 422 |
| `DELETE` | `/api/drones/{id}` | Remove drone parado | 204 · 404 · 422 |
| `GET` | `/api/entregas/rota` | Viagens no ar + prévia de como a fila será dividida | 200 |
| `GET` | `/api/entregas` | Últimas 50 viagens concluídas | 200 |
| `GET` · `POST` · `DELETE` | `/api/zonas` | Zonas de exclusão aérea | 200 · 201 · 204 · 422 |
| `GET` | `/api/dashboard` | Indicadores do relatório | 200 |
| `GET` | `/api/dashboard/mapa-ascii` | Mapa das entregas em texto | 200 |
| `GET` | `/api/dashboard/entregas.csv` | Entregas em CSV (Excel, Flourish, Tableau) | 200 |
| `GET` | `/api/simulacao/status` | Relógio, tamanho da cidade e base | 200 |
| `POST` | `/api/simulacao/despachar` | Força um despacho agora | 200 |
| `POST` | `/api/simulacao/pedidos-aleatorios?quantidade=20` | Gera pedidos válidos | 200 · 400 |
| `POST` | `/api/simulacao/reiniciar?pedidos=0` | Apaga tudo e recomeça | 204 |
| `GET` | `/api/status` | A API e o MongoDB estão no ar? | 200 |
| `GET` | `/actuator/prometheus` | Métricas para o Prometheus | 200 |

### Exemplos

```bash
# criar pedido
curl -X POST http://localhost:8080/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{"cliente":"Ana","x":12.5,"y":7,"pesoKg":2.5,"prioridade":"alta"}'

# o mapa em texto, direto no terminal
curl http://localhost:8080/api/dashboard/mapa-ascii
```

### Erros claros (pedido do case)

Todo erro volta no mesmo formato, com uma `mensagem` que pode ir direto para a tela:

```json
{
  "status": 422,
  "erro": "Unprocessable Entity",
  "mensagem": "O pacote de 30,00 kg excede a capacidade máxima da frota (15,0 kg).",
  "caminho": "/api/pedidos",
  "timestamp": "2026-10-25T10:53:35Z",
  "campos": {}
}
```

| Código | Quando | Exemplo de mensagem |
| --- | --- | --- |
| **400** | JSON quebrado ou campo obrigatório faltando (`@Valid`) | `campos.pesoKg: "Informe o peso do pacote em kg."` |
| **400** | Prioridade desconhecida | `Prioridade "urgente" inválida. Use baixa, media ou alta.` |
| **404** | id não existe | `Pedido com id "x" não encontrado.` |
| **422** | Pesado demais | `O pacote de 30,00 kg excede a capacidade máxima da frota (15,0 kg).` |
| **422** | Dentro de zona proibida | `O endereço fica dentro da zona de exclusão aérea "Aeroporto".` |
| **422** | Longe demais | `O endereço exige 31,2 km de voo (ida e volta) e o maior alcance da frota é 30,0 km.` |
| **422** | Fora da cidade | `O endereço (25,0, 7,0) está fora da cidade. Use x entre 0 e 20 e y entre 0 e 20.` |
| **503** | MongoDB fora do ar | `Não foi possível conectar ao MongoDB...` |

> **400 × 422:** 400 é "não entendi o que você mandou" (formato). 422 é "entendi, mas isso quebra uma regra do negócio". Saber explicar essa diferença conta pontos.

---

## 🚀 Como rodar

### Pré-requisitos

| O quê | Para quê | Como conferir |
| --- | --- | --- |
| **JDK 21** | Rodar o Spring Boot | `java -version` |
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
docker run -d --name mongo-drones -p 27017:27017 mongo:7    # MongoDB local
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

Na primeira subida, o `DadosIniciais` cria a frota (4 drones) e as 3 zonas de exclusão.

**3. Front-end** (terminal 2):

```bash
cd Front
npm install                     # só na primeira vez
npm run dev
```

Abra http://localhost:5173 e clique em **Gerar 20 pedidos**. Em segundos os drones decolam.

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
| `MONGODB_DATABASE` | `app.mongodb.database` | `DronesDTI` |
| `CORS_ORIGINS` | `app.cors.allowed-origins` | `http://localhost:5173`, Vercel e domínios dti |
| `PORT` | `server.port` | `8080` (o Render injeta a dele) |

Parâmetros da simulação (mude e reinicie para experimentar):

| Propriedade | Padrão | Efeito |
| --- | --- | --- |
| `app.simulacao.fator-tempo` | `60` | 1 s real = 60 s simulados. Use `600` para ver tudo 10× mais rápido |
| `app.simulacao.despacho-automatico` | `true` | `false`: só despacha pelo botão / `POST /despachar` |
| `app.simulacao.limiar-recarga` | `30` | Abaixo deste % o drone vai recarregar |
| `app.simulacao.minutos-envelhecimento` | `30` | Espera para o pedido subir um nível de prioridade |
| `app.simulacao.limite-exato` | `8` | Até quantas paradas o caixeiro viajante é exato |
| `app.simulacao.max-paradas` | `10` | Máximo de entregas por viagem |
| `app.cidade.largura-km` / `altura-km` | `20` | Tamanho da malha |

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

Não precisa criar banco nem coleções: o MongoDB cria `DronesDTI` e as coleções `pedidos`, `drones`, `viagens` e `zonas` no primeiro `save`. Para ver os dados: **Database › Browse Collections**.

---

## 🧪 Testes automatizados

### Back-end: JUnit 5 + Mockito + MockMvc

```bash
cd Back
./mvnw test                     # roda tudo
./mvnw test -Dtest=PlanejadorViagensTest   # uma classe só
```

O relatório de **cobertura** (JaCoCo) fica em `Back/target/site/jacoco/index.html`.

| Classe de teste | Tipo | O que garante |
| --- | --- | --- |
| `CaixeiroViajanteTest` | unitário puro | exato = força bruta em 20 casos aleatórios; 2-opt desfaz cruzamentos; recursão em cauda com 1.000 paradas |
| `PlanejadorViagensTest` | unitário + **carga** | consolida pacotes; nunca passa do peso nem do alcance; prioridade alta primeiro; usa a bateria atual; **500 pedidos em < 5 s** |
| `MapaAereoTest` | unitário puro | desvio de zona, ponto bloqueado, voar rente à borda |
| `FilaEntregasTest` | unitário puro | ordem por prioridade/chegada e envelhecimento |
| `LinhaDoTempoTest` | unitário puro | ciclo de estados, duração e posição no meio do voo |
| `PedidoServiceTest` | **Mockito** | validações (peso, zona, alcance, cidade, frota), cancelamento, 404 e rastreio "2 quadras" |
| `SimulacaoServiceTest` | **Mockito** | IDLE → CARREGANDO → EM_VOO → ... → IDLE/RECARREGANDO com relógio controlado |
| `DashboardServiceTest` | **Mockito** | tempo médio, drone mais eficiente e mapa ASCII |
| `PedidoControllerTest` | **MockMvc** + Mockito | 201, 400 com campos, 422, JSON inválido e 404 |

**O que é Mockito, em uma frase:** ele cria **dublês** (mocks) dos repositories, então o teste do `PedidoService` roda **sem MongoDB**, em milissegundos, testando só a regra.

```java
when(droneRepository.findAll()).thenReturn(List.of(new Drone("Falcão", 10, 30, 60, base)));

RegraNegocioException e = assertThrows(RegraNegocioException.class,
        () -> service.criar(new PedidoRequest("Ana", 12.0, 7.0, 12.0, "baixa")));

assertTrue(e.getMessage().contains("excede a capacidade"));
verify(pedidoRepository, never()).save(any());   // não pode ter gravado nada
```

**Truque do relógio:** o `Clock` é **injetado** (bean em `BeansConfig`). No teste usamos um relógio falso que avançamos à mão (`clock.avancarSegundos(3)`) para testar a máquina de estados sem esperar o tempo passar.

### Front-end: Vitest + Testing Library

```bash
cd Front
npm test                        # roda uma vez
npm run test:watch              # fica observando
```

| Arquivo | O que garante |
| --- | --- |
| `PedidoForm.test.jsx` | campos obrigatórios, limites da cidade, vírgula decimal, prioridade, erro 422 da API, clique no mapa preenche x/y |
| `httpClient.test.js` | JSON no POST, ErroApi com a mensagem do back-end, servidor fora do ar, 204 |
| `MapaAereo.test.jsx` | acessibilidade, desenho de zonas/drones/rotas, inversão do eixo y |
| `DroneLista.test.jsx` | estado, carga, bateria vermelha abaixo de 25%, lista vazia |
| `Dashboard.test.jsx` | indicadores com a API mockada (`vi.mock`) |
| `contraste.test.js` · `formatadores.test.js` | WCAG e formatação pt-BR |

### CI

O [`.github/workflows/ci.yml`](.github/workflows/ci.yml) roda os testes do back e do front em todo `push`. O selo verde na aba **Actions** do GitHub é um ótimo sinal para quem avalia.

---

## 📈 Testes de carga e observabilidade

Ferramenta: **[Grafana k6](https://k6.io)**. Os scripts são JavaScript e o k6 é open source, e conversa direto com Prometheus/Grafana.

| Script | Cenário | Limites (thresholds) |
| --- | --- | --- |
| `load-tests/smoke.js` | 1 usuário, 30 s | erro < 1%, p95 < 500 ms |
| `load-tests/carga.js` | sobe até **50 usuários**, mantém 2 min | erro < 1%, p95 < 800 ms, `POST /pedidos` p95 < 500 ms |
| `load-tests/pico.js` | **0 → 200 usuários em 10 s** | erro < 5%, p95 < 3 s |

Cada usuário virtual faz o que a tela de Operação faz: cria um pedido válido (fora das zonas, dentro do alcance) e consulta drones, rotas e fila.

### Só o k6 (terminal)

```bash
# instale: https://grafana.com/docs/k6/latest/set-up/install-k6/
k6 run load-tests/smoke.js
k6 run load-tests/carga.js
k6 run -e API_URL=https://drones-dti-api.onrender.com load-tests/smoke.js   # contra o deploy
```

Exemplo de saída (os números variam com a máquina, o banco e a rede):

```text
✓ pedido criado (201)
✓ consulta 200
http_req_duration{endpoint:POST /api/pedidos}.......: avg=10.68ms p(95)=52.25ms
http_req_duration{endpoint:GET /api/entregas/rota}..: avg=114.88ms p(95)=368.53ms
http_req_failed......................................: 0.00% 0 out of 790
```

> Repare que `GET /api/entregas/rota` é o mais lento: ele roda o **planejador inteiro** sobre a fila para montar a prévia. É um ótimo ponto para discutir na entrevista (cache, calcular só no despacho, paginação...).

### k6 + Prometheus + Grafana (observabilidade)

Com a API rodando em `localhost:8080`:

```bash
cd load-tests/observabilidade
docker compose up -d prometheus grafana
docker compose run --rm k6                # roda o carga.js mandando métricas ao Prometheus
```

Abra **http://localhost:3000** (admin/admin) › Dashboards › **DronesDTI - carga**:

| Painel | Fonte |
| --- | --- |
| Usuários virtuais, req/s, p95 por endpoint, taxa de erro | k6 (remote write) |
| Req/s e tempo médio por rota, heap da JVM, CPU | Spring Boot (`/actuator/prometheus`, Micrometer) |

Ver a latência do k6 **e** a CPU/memória da JVM no mesmo gráfico é o que transforma "teste de carga" em **observabilidade**: você descobre *por que* ficou lento.

---

## 📊 Dashboard

**Decisão:** o dashboard é **parte do próprio app** (página `/dashboard`, gráficos com **Recharts**), alimentado por `GET /api/dashboard`.

| Opção | Prós | Contras |
| --- | --- | --- |
| **Recharts no app** ✅ | ao vivo (3 s), sem conta externa, versionado no Git, roda no deploy | gráficos programados à mão |
| Flourish / Tableau | gráficos lindos sem código | dados estáticos (upload), conta externa, não fica "dentro" do sistema |

Para quem quiser também o Flourish ou o Tableau, o botão **Baixar entregas (CSV)** (`GET /api/dashboard/entregas.csv`) exporta as entregas. No [Flourish](https://flourish.studio): *New visualisation › Scatter* › *Upload data* › use `x` e `y` como eixos e `prioridade` como cor.

Indicadores (todos pedidos pelo case): **entregas realizadas**, **tempo médio por entrega**, **drone mais eficiente** (entregas por km voado), **mapa das entregas** (gráfico e **ASCII**), além de pacotes por viagem, ocupação média, tempo por prioridade e últimas viagens.

---

## 🎨 Design system

A página **`/design`** (link no rodapé) documenta a identidade visual contando a história das decisões, no mesmo espírito da página de design do projeto AraCoffee. Ela tem botão **Salvar em PDF** (impressão do navegador com CSS de impressão).

| Token | Valor | Uso |
| --- | --- | --- |
| Azul dti | `#000066` | marca, cabeçalho, fundo do mapa aéreo |
| Ciano | `#40E6F2` | rotas no ar, drones em voo |
| Laranja | `#FC6D3A` | prioridade alta, zonas proibidas, urgência |
| Azul elétrico | `#3038D5` | botões, links, foco |
| Papel | `#F4F4F4` | fundo das páginas |
| Fontes | **Red Hat Display** (títulos) + **Red Hat Text** (texto) | via `@fontsource` |

As cores foram tiradas do PDF do processo seletivo e o logo da dti vem do arquivo oficial enviado (versões branca, azul e ciano em `Front/public/`). Os tokens ficam em `src/config/designSystem.js` e como variáveis CSS em `src/index.css`. A página calcula o **contraste WCAG** de cada par de cores na hora.

---

## ☁️ Deploy

**Ordem recomendada:** MongoDB Atlas → back-end no Render → front-end no Vercel → liberar o domínio do Vercel no CORS.

### 1. Back-end no Render (Docker)

**Jeito rápido (Blueprint):** no Render, *New › Blueprint* › escolha o repositório. O [`render.yaml`](render.yaml) cria o serviço `drones-dti-api` e pede o valor de `MONGODB_URI`.

**Jeito manual:** *New › Web Service* › repositório › **Root Directory:** `Back` › **Runtime:** Docker › variáveis:

| Variável | Valor |
| --- | --- |
| `MONGODB_URI` | connection string do Atlas |
| `CORS_ORIGINS` | `https://drones-dti.vercel.app,https://*.vercel.app,https://drones.dti.dev,https://drones.dti.io` |

Teste: `https://drones-dti-api.onrender.com/api/status`.

> 💤 O plano grátis "dorme" após 15 min sem acesso. A primeira requisição depois disso demora uns 50 s. O cabeçalho do site mostra "Conectando ao servidor" enquanto isso.

### 2. Front-end no Vercel

*Add New › Project* › repositório › **Root Directory:** `Front` (o Vercel detecta Vite) › **Environment Variables:**

| Variável | Valor |
| --- | --- |
| `VITE_API_URL` | `https://drones-dti-api.onrender.com` (sem `/` no final) |

Em *Settings › Domains*, defina `drones-dti.vercel.app`.

**Por que existe o `vercel.json`?** O React Router muda a URL no navegador (`/pedidos`), mas não existe arquivo `/pedidos` no servidor. O *rewrite* manda toda rota para o `index.html` e o React decide o que mostrar. Sem ele, dar F5 em `/dashboard` dá 404. O `nginx.conf` faz o mesmo na imagem Docker.

### 3. Domínio próprio (`drones.dti.dev` / `drones.dti.io`)

Quem administra o DNS do domínio cria os registros:

| Registro | Nome | Aponta para | Serviço |
| --- | --- | --- | --- |
| `CNAME` | `drones` | `cname.vercel-dns.com` | front (Vercel › Settings › Domains) |
| `CNAME` | `api.drones` | `drones-dti-api.onrender.com` | API (Render › Settings › Custom Domains) |

Depois, troque `VITE_API_URL` para `https://api.drones.dti.dev` e confira se o domínio está em `CORS_ORIGINS`. Os certificados HTTPS são emitidos automaticamente pelos dois serviços.

### 4. Entrega do case (como pede o PDF)

- Repositório **público** no GitHub.
- E-mail para `rh.hakuna@dtidigital.com.br` com o título **`Teste prático dti digital – Seu nome`**, o link do repositório e **a tecnologia escolhida no corpo** (ex.: "Java 21 + Spring Boot 4 no back-end, React 19 + Vite no front-end, MongoDB").
- Respeite o prazo: quem não envia no horário é desclassificado.

---

## 🤖 Uso de IA

O PDF aceita, como entregável opcional, o markdown com as **rules, memórias e prompts** usados com IA. Eles estão em [`docs/IA.md`](docs/IA.md). Usar IA é permitido e esperado; o que conta é **entender e conseguir explicar cada decisão** (o [ROTEIRO.md](ROTEIRO.md) ajuda nisso).

---

## 🛠️ Problemas comuns

| Sintoma | Causa provável | Solução |
| --- | --- | --- |
| `"mongodb": "offline"` em `/api/status` | connection string errada ou IP bloqueado no Atlas | confira `MONGODB_URI` e *Network Access* (`0.0.0.0/0`) |
| Erro de **CORS** no console (F12) | origem do front não liberada | inclua a URL em `CORS_ORIGINS`, sem `/` no final |
| Front mostra "Servidor fora do ar" | back-end desligado ou `VITE_API_URL` errado | suba o back; no Vercel, refaça o deploy após mudar a variável |
| `Port 5173 is already in use` | outro Vite aberto | feche o outro terminal (a porta é fixa por causa do CORS) |
| `./mvnw: Permission denied` | Linux/macOS sem permissão de execução | `chmod +x mvnw` |
| F5 numa rota dá 404 no deploy | faltou o rewrite | confira o `vercel.json` na pasta `Front` |
| Drones não saem da base | nenhum pedido cabe na bateria atual | espere a recarga ou gere pedidos mais perto da base |

---

## 🔭 Próximos passos

Ideias de evolução, que também são ótimas respostas para "o que você faria com mais tempo?":

- **WebSocket/SSE** no lugar do polling (o servidor avisa quando algo muda).
- **Várias instâncias** da API: hoje a trava da simulação é `synchronized` (uma JVM). Com várias, seria preciso uma trava distribuída (ex.: ShedLock) ou um único "worker" de simulação.
- **Mais de uma viagem por drone no plano**, otimizando a frota inteira de uma vez (ex.: *Clarke-Wright savings* ou programação linear inteira).
- **Testes de integração** com Testcontainers (MongoDB real em Docker durante o teste).
- **Autenticação** (Spring Security + JWT) para separar cliente de operador.
- **Swagger/OpenAPI** (springdoc) para documentação interativa da API.

---

## 📚 Para estudar

- Caixeiro viajante, *branch and bound* e 2-opt: qualquer livro de Projeto e Análise de Algoritmos (ex.: Cormen, *Algoritmos*).
- Bin packing e heurísticas gulosas (*First Fit Decreasing*).
- Grafo de visibilidade e Dijkstra (*Computational Geometry*, de Berg et al.).
- [Spring Boot](https://spring.io/projects/spring-boot) · [Spring Data MongoDB](https://spring.io/projects/spring-data-mongodb) · [Mockito](https://site.mockito.org) · [Vitest](https://vitest.dev) · [Testing Library](https://testing-library.com) · [Grafana k6](https://grafana.com/docs/k6/latest/) · [Recharts](https://recharts.org) · [Mermaid](https://mermaid.js.org)

---

## 📄 Licença

MIT. Veja [LICENSE](LICENSE). Marca, logo e cores pertencem à **dti digital** e são usados aqui apenas no contexto do processo seletivo.
