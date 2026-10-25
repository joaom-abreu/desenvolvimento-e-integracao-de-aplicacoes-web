# 🎤 Roteiro: como apresentar este projeto na entrevista técnica

Este roteiro é para a etapa **"Entrevista técnica & cultural"** do processo da dti, onde, segundo o PDF, *"exploraremos como você resolveu o seu case"*. Normalmente quem conduz é uma **liderança técnica** (tech lead, arquiteto ou DL). Ela quer saber três coisas:

1. **Você entendeu o problema?** (não só o código)
2. **Você sabe justificar suas decisões?** (e conhece os limites delas)
3. **Você trabalha bem em time?** (comunicação clara, testes, abertura a feedback)

> 💡 Regra de ouro: **problema → decisão → por quê → limite → como eu evoluiria.** Toda resposta boa segue essa ordem.

---

## ⏱️ Estrutura sugerida (15 a 20 minutos)

| Tempo | Bloco | Objetivo |
| --- | --- | --- |
| 1 min | Pitch | dizer o que é e o que tem de diferente |
| 2 min | O problema | mostrar que você entendeu o case |
| 3 min | Demo ao vivo | provar que funciona |
| 4 min | Arquitetura | mostrar organização |
| 5 min | Algoritmo | o coração da avaliação |
| 2 min | Qualidade | testes, erros, carga |
| 1 min | Limites e próximos passos | maturidade |
| resto | Perguntas | conversa |

Se o entrevistador tiver pouco tempo, faça **Pitch → Demo → Algoritmo** e pare.

---

## 1. Pitch (1 minuto)

> "Eu fiz um simulador de entregas por drone em **Spring Boot com MongoDB** no back-end e **React com Vite** no front. O sistema recebe pedidos com localização, peso e prioridade, e **aloca os pacotes buscando o menor número de viagens**, respeitando o peso máximo e o alcance da bateria de cada drone. Cada viagem tem a rota otimizada por um **caixeiro viajante**, as rotas desviam de **zonas de exclusão aérea** e os drones passam por uma **máquina de estados** em tempo real. Tem testes com JUnit, Mockito e Vitest, teste de carga com k6 e está pronto para deploy no Vercel e no Render."

Treine até sair em 60 segundos, sem ler.

---

## 2. O problema (2 minutos)

Comece pelo **negócio**, não pelo código:

> "O objetivo principal do case é **minimizar o número de viagens**. Isso, no fundo, junta dois problemas clássicos: **bin packing**, que é encaixar pesos em caixas de capacidade X, e **caixeiro viajante**, porque a rota de cada viagem precisa caber em Y km. Os dois são **NP-difíceis**, então eu sabia desde o início que não ia buscar a solução ótima para tudo: ia usar **heurísticas** e **medir** a qualidade."

Isso mostra que você pensou antes de codar. É a frase que mais impressiona.

Mencione também as **premissas** que você assumiu (todo case tem lacunas):

- cidade 20 × 20 km, base no centro, 1 quadra = 100 m;
- bateria cheia = alcance Y; consumo proporcional à distância;
- 1 segundo real = 1 minuto simulado;
- carregar leva 2 min e cada entrega leva 1 min.

> "Onde o enunciado não definia, eu assumi e deixei **configurável** no `application.properties`."

---

## 3. Demo ao vivo (3 minutos)

**Prepare antes:** back e front rodando, banco limpo (`POST /api/simulacao/reiniciar`), navegador aberto em `/`. Tenha **capturas de tela de reserva** (pasta `imgs/`) caso a internet ou o Render falhem.

Sequência que conta uma história:

1. **Operação** → clique em **Gerar 20 pedidos**. "Os drones saem sozinhos: o relógio do servidor despacha a cada segundo." Mostre um drone mudando de estado no cartão (Carregando → Em voo → Entregando).
2. **Rotas** → "Aqui está o resultado do algoritmo." Clique em uma viagem: "o Falcão leva 5 pacotes, 98% da capacidade, e a rota foi calculada pelo método **exato**." Mostre um desvio de zona. Mostre o **mínimo teórico** e explique por que o número real é maior: o alcance.
3. **Pedidos** → clique no mapa, crie um pedido de **18 kg**: aparece o erro 422 *"excede a capacidade máxima da frota"*. "A regra fica no back-end; o front só mostra a mensagem."
4. **Rastreio** de um pedido em rota: *"Seu pacote está a 12 quadras de distância"*.
5. **Dashboard** → entregas, tempo médio, drone mais eficiente, mapa ASCII.

---

## 4. Arquitetura (4 minutos)

Abra o **diagrama de componentes** do README e siga o caminho de uma requisição:

> "O `PedidoController` só cuida de HTTP: valida o formato com `@Valid` e devolve 201. As regras ficam no `PedidoService`: dentro da cidade, fora de zona proibida, peso e alcance compatíveis com algum drone. Se quebrar uma regra, lanço `RegraNegocioException`, e o `GlobalExceptionHandler` transforma em **422** com uma mensagem clara."

Pontos que valem destacar:

- **Pacote `algoritmo` em Java puro.** "Não depende de Spring nem de banco. Por isso testo o planejador com 500 pedidos em menos de 1 segundo, sem subir nada."
- **DTO ≠ model.** "A API não expõe o documento do Mongo; se o banco mudar, o contrato não muda."
- **`Clock` injetado.** "Para testar a máquina de estados eu avanço o relógio na mão no teste."
- **Por que MongoDB?** "A viagem é um agregado: paradas, caminho e fases são lidos sempre juntos. Um documento só resolve sem joins."
- **Por que polling e não WebSocket?** "Simplicidade e funciona no plano grátis do Render. Seria minha primeira evolução."

Mostre também o **diagrama de implantação**: Vercel (CDN) → Render (Docker) → Atlas, com CORS no meio.

---

## 5. O algoritmo (5 minutos) ⭐

Esta é a parte mais avaliada. Fale em 4 passos, com o diagrama ou o código aberto:

**a) Fila:** "Ordeno por prioridade e, empatando, por chegada. Para a baixa não esperar para sempre, uso **envelhecimento**: a cada 30 minutos o pedido sobe um nível. É o mesmo problema de inanição de escalonamento de processos."

**b) Planejador, semente + preenchimento:** "Para cada drone livre, começo pelo **primeiro da fila que cabe**: isso garante a prioridade. Depois encho o drone com quem tem melhor **kg por km extra**, estimando o km extra pela **inserção mais barata**. Paro quando não cabe mais nada no peso ou no alcance."

**c) Caixeiro viajante:** "Até 8 paradas faço **backtracking com poda**: é exato e, com a poda, rápido. Acima disso uso **vizinho mais próximo**, que escrevi com **recursão em cauda**, mais **2-opt** para desfazer cruzamentos."

**d) Obstáculos:** "Se a linha reta cruza uma zona, monto um **grafo de visibilidade** com os cantos das zonas e rodo **Dijkstra**."

Feche com números: *"500 pedidos viraram 119 viagens em menos de 1 segundo, sem nenhuma violar peso ou alcance."*

### A pergunta da recursão em cauda (vai aparecer!)

> **"Java otimiza recursão em cauda?"**
>
> "Não. A JVM não faz *tail call optimization*; Scala e Kotlin fazem na compilação. Cada chamada ainda empilha um quadro. No meu caso a profundidade é o número de paradas de uma viagem, no máximo 10, então não há risco. E por estar em cauda, converter para `while` é mecânico: os parâmetros viram variáveis. Tenho um teste com 1.000 paradas mostrando que não estoura."

Saber isso mostra que você **entende** o que escreveu, e não só copiou.

---

## 6. Qualidade (2 minutos)

- **Testes unitários com Mockito:** "os repositories são mocks; testo a regra sem banco." Mostre `PedidoServiceTest.pesadoDemais` e o `verify(..., never()).save(...)`.
- **MockMvc:** "testo os códigos HTTP: 201, 400 com o campo destacado, 422 e 404."
- **Teste de carga dentro do JUnit:** 500 pedidos com asserts de capacidade e alcance.
- **k6:** "50 usuários simultâneos com limites de p95; com Prometheus e Grafana vejo latência **e** memória da JVM juntos." Comente que `GET /entregas/rota` é o mais lento porque roda o planejador inteiro.
- **Front:** Vitest + Testing Library testando o formulário como o usuário usa (digitar, clicar, ver a mensagem).
- **CI** no GitHub Actions.

---

## 7. Limites e próximos passos (1 minuto)

Falar dos limites **antes** de perguntarem é sinal de senioridade:

- "A heurística não garante o mínimo de viagens; meço contra um limite inferior."
- "A trava da simulação é `synchronized`: funciona com **uma** instância. Para escalar horizontalmente eu usaria um worker único ou trava distribuída."
- "Polling a cada segundo gera tráfego; eu trocaria por SSE ou WebSocket."
- "Faltam testes de integração com Testcontainers e autenticação."

---

## ❓ Perguntas prováveis (e como responder)

| Pergunta | Caminho da resposta |
| --- | --- |
| Por que guloso e não ótimo? | NP-difícil; o exato explode (N!); guloso é O(N²) por viagem, previsível e explicável; medi a qualidade |
| Qual a complexidade do planejador? | por viagem: O(N × paradas) para o preenchimento + TSP da viagem (exato até 8, heurístico depois) |
| Como garante que não passa do alcance? | inserção mais barata é limite superior da rota ótima; o TSP final só encurta; testes verificam |
| E a prioridade? | a semente é sempre o primeiro da fila; no preenchimento, prioridade vem antes da eficiência |
| E se dois ticks rodarem juntos? | `fixedDelay` não sobrepõe; e os métodos que mudam estado usam a mesma trava |
| O que acontece se o servidor reiniciar no meio de uma viagem? | o estado está no banco com timestamps; o próximo tick recalcula onde o drone está |
| Por que 422 e não 400? | 400 = formato inválido; 422 = formato ok, regra de negócio quebrada |
| Por que CORS? | front e API em origens diferentes; quem bloqueia é o navegador; quem libera é o back |
| Como testaria com Mongo de verdade? | Testcontainers sobe um Mongo em Docker no teste de integração |
| Usou IA? | sim, e está documentado em `docs/IA.md`; revisei, testei e sei explicar cada parte |
| O que faria diferente? | separar o motor de simulação num worker, eventos via SSE, otimização global da frota |

**Se não souber algo:** "Não sei, mas eu investigaria assim: ...". Nunca invente.

---

## ✅ Checklist do dia

- [ ] Projeto rodando localmente **e** link do deploy aberto (o Render pode estar "dormindo": abra 2 minutos antes)
- [ ] Banco limpo e frota de exemplo criada
- [ ] README aberto nos diagramas
- [ ] IDE aberta em `PlanejadorViagens`, `CaixeiroViajante` e `PedidoServiceTest`
- [ ] Terminal pronto com `./mvnw test` e `npm test`
- [ ] Capturas de tela como plano B
- [ ] Água, câmera ligada, notificações desligadas

## 🚫 Evite

- Começar pelo código linha a linha ("aqui eu criei uma classe...").
- Dizer "a IA fez essa parte". Diga o que **você** decidiu e por quê.
- Esconder limitações. Assuma e diga como resolveria.
- Falar por 20 minutos sem checar: pergunte "quer que eu aprofunde no algoritmo ou na arquitetura?".

## 🗣️ Frases-modelo

- "A decisão foi **X**, porque **Y**. O custo dessa decisão é **Z**; se o requisito mudasse para **W**, eu faria **V**."
- "Eu medi: com 500 pedidos, ..."
- "Isso está coberto pelo teste `...`, quer que eu mostre?"
