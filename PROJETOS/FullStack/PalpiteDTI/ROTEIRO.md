# 🎤 Roteiro: como apresentar este projeto na entrevista técnica

Este roteiro é para a conversa em que a dti explora como você resolveu o teste. Normalmente quem conduz é uma **liderança técnica** (tech lead, arquiteto ou DL). O enunciado é simples de propósito ("adivinhe um número de 1 a 100"), então a avaliação **não** é sobre o jogo. É sobre três coisas:

1. **Qualidade do código:** separação de responsabilidades, nomes, orientação a objetos, clareza (critérios do PDF).
2. **Tratamento de erros e feedback:** o que acontece quando algo dá errado, e o que o usuário lê.
3. **Decisões justificadas:** por que REST desse jeito, por que esse banco, por que esses testes.

> 💡 Regra de ouro: **problema → decisão → por quê → limite → como eu evoluiria.** Toda resposta boa segue essa ordem.

---

## ⏱️ Estrutura sugerida (15 minutos)

| Tempo | Bloco | Objetivo |
| --- | --- | --- |
| 1 min | Pitch | dizer o que é e o que tem de diferente |
| 1 min | O problema e as premissas | mostrar que você leu o PDF com atenção |
| 3 min | Demo ao vivo | provar que funciona (e que os erros são bem tratados) |
| 4 min | Arquitetura e API REST | organização, rotas, status HTTP |
| 3 min | A regra do jogo e a busca binária | o "algoritmo" escondido no enunciado |
| 2 min | Qualidade | testes, SCSS, acessibilidade |
| 1 min | Limites e próximos passos | maturidade |

Se o entrevistador tiver pouco tempo: **Pitch → Demo → API REST e erros** e pare.

---

## 1. Pitch (1 minuto)

> "Eu fiz o PalpiteDTI, um jogo de adivinhação em **Spring Boot com MongoDB** no back-end e **React com Vite** no front. O servidor sorteia um número de 1 a 100 e responde se cada palpite é maior ou menor. **Toda a comparação acontece no back-end**, e o número nunca chega ao navegador enquanto a partida está aberta. A API segue REST, com **201, 400, 404, 409 e 422** usados com critério. Fiz também os bônus do PDF: **ranking salvo no banco**, **SCSS com Autoprefixer**, **testes no front e no back**, e uma página de estatísticas. Tem teste de carga com k6 e está pronto para deploy no Vercel e no Render."

Treine até sair em 60 segundos, sem ler.

---

## 2. O problema e as premissas (1 minuto)

Comece mostrando que você leu o PDF **inteiro**, inclusive os critérios:

> "O PDF pede quatro coisas funcionais: informar um número de 1 a 100, dizer se é maior ou menor, avisar o acerto e permitir uma nova rodada, e **fazer o cálculo no back-end**. E avalia separação de responsabilidades, tratamento de erros, mensagens de feedback e HTML semântico."

Mencione as **premissas** (o PDF pede que você as entregue):

- O PDF pede .NET; com o aval do projeto, usei **Java 17 + Spring Boot** (e MongoDB Atlas no lugar de SQLite). A arquitetura seria a mesma em .NET.
- "Maior" e "menor" comparam **o palpite com o sorteado**: "50 é maior que o número sorteado, tente um número menor".
- Palpite **repetido não conta** como tentativa e recebe 422.
- Decimais (42,5) são **recusados**, nunca arredondados.
- Nome é opcional; sem nome, o jogador entra como "Anônimo".
- Uma rodada fica salva: dar F5 no meio do jogo não a perde.

---

## 3. Demo ao vivo (3 minutos)

**Prepare antes:** back e front rodando, banco com dados de exemplo (`POST /api/simulacao/reiniciar?partidas=30`), navegador aberto em `/`. Tenha as **capturas de tela de reserva** (pasta `imgs/`) caso a internet ou o Render falhem.

Sequência que conta uma história:

1. **Jogar:** digite seu nome e clique em **Começar rodada**. Chute **50**. "O servidor respondeu 'maior'. Repare no tabuleiro: metade dos números apagou."
2. Chute **um número do lado errado** de propósito (ex.: 70 depois de "50 é maior"): aparece a dica *"Esse palpite não ajudou: o número está entre 1 e 49"*. "Isso é feedback, um dos critérios do PDF."
3. Digite **150**: o erro aparece no próprio campo, sem chamar a API. "O front valida para responder rápido, mas o back valida de novo, porque o front pode ser burlado."
4. Abra o **F12 › Network** e mostre a resposta do palpite: `"numeroSecreto": null`. "O número não está no navegador."
5. Termine em **busca binária** (sempre o meio da faixa): acerte em até 7. Mostre a **posição no ranking**.
6. **Ranking** e **Estatísticas**: "o gráfico mostra quantas partidas ficaram dentro do limite de 7."

---

## 4. Arquitetura e API REST (4 minutos)

Abra o **diagrama de componentes** do README e siga um palpite:

> "O `PartidaController` só cuida de HTTP: valida o formato com `@Valid` e devolve 201. O `PartidaService` carrega a partida, chama o `Arbitro` e grava. O `Arbitro` está no pacote `jogo`, em **Java puro**: ele aplica as regras e lança `RegraNegocioException` (422) ou `ConflitoException` (409). O `GlobalExceptionHandler` transforma qualquer exceção num JSON com uma `mensagem` pronta para a tela."

Mostre a tabela de rotas e explique as escolhas:

| Pergunta provável | Resposta |
| --- | --- |
| Por que `POST /partidas/{id}/palpites` e não `POST /chutar`? | REST modela **recursos** (substantivos). Um palpite é um recurso que pertence a uma partida; o verbo é o método HTTP. |
| Por que 201 no palpite? | Porque cria um recurso (o palpite). Vem com o cabeçalho `Location`. |
| 400 × 422 × 409? | 400: não entendi o que você mandou (sem número, 42.5, JSON quebrado). 422: entendi, mas quebra a regra (150, repetido). 409: a partida não está mais num estado que aceita palpite. |
| Desistir não deveria ser `DELETE`? | `DELETE` apagaria a partida, e ela precisa continuar existindo (para as estatísticas). Modelei a desistência como um recurso: `POST /partidas/{id}/desistencia`. Outra opção válida seria `PATCH /partidas/{id}` com o status. |
| Por que MongoDB? | A partida e seus palpites são lidos e gravados **sempre juntos**: um documento só, sem join. O ranking usa um **índice composto** (status, tentativas, duração). |
| E se dois palpites chegarem ao mesmo tempo? | `@Version` na `Partida`: concorrência otimista. O segundo recebe 409 em vez de sobrescrever o primeiro. |

Pontos que valem destacar:

- **DTO ≠ model.** "A API não expõe o documento do Mongo. É no `PartidaResponse` que o número secreto é escondido."
- **`Sorteador` é uma interface (Strategy).** "Em produção, `SecureRandom`; no teste, uma lambda que sempre devolve 42, para eu saber a resposta."
- **`Clock` injetado.** "Para testar a duração da partida sem esperar o tempo passar."

---

## 5. A regra do jogo e a busca binária (3 minutos) ⭐

O enunciado esconde um algoritmo clássico. Mostrar que você o reconheceu impressiona:

> "Cada resposta do juiz corta a faixa possível. Se eu sempre chuto o meio, corto pela metade: 100, 50, 25, 13, 7, 4, 2, 1. Isso é **busca binária**, e o pior caso é **⌊log₂ 100⌋ + 1 = 7 tentativas**. Usei isso em três lugares: a classificação do jogador ('Excelente' até 7), o robô que gera partidas de exemplo, e um teste que joga **os 100 números** e prova que nenhum passa de 7."

Mostre `Desempenho.tentativasIdeais`:

```java
return Integer.SIZE - Integer.numberOfLeadingZeros(n);   // floor(log2 n) + 1, só com bits
```

E o `Intervalo.meio()`:

```java
return (minimo + maximo) >>> 1;   // e não (minimo + maximo) / 2
```

> "Esse `>>> 1` evita estouro de `int` quando a soma passa de 2 bilhões. É o bug que ficou anos na busca binária do próprio JDK, corrigido em 2006. Aqui não estoura com 100, mas tenho um teste com números perto do limite."

---

## 6. Qualidade (2 minutos)

- **Testes do jogo sem framework:** `ArbitroTest`, `IntervaloTest`, `JuizTest` (parametrizado), `DesempenhoTest`. "Rodam em milissegundos, sem Spring."
- **Mockito:** "no `PartidaServiceTest` o repository é um mock; verifico que um palpite repetido **não grava nada** (`verify(..., times(1)).save(...)`)."
- **MockMvc:** "testo os status HTTP e o cabeçalho `Location`."
- **Carga:** um teste JUnit joga 100 mil partidas em menos de 1 segundo; o **k6** simula 50 jogadores simultâneos jogando partidas inteiras.
- **Front:** Vitest + Testing Library testando como o usuário usa (digitar, apertar Enter, ler a mensagem), inclusive o fluxo inteiro da página Jogar com a API mockada.
- **SCSS + PostCSS:** "partials, mixins e breakpoints em Sass; tokens como variáveis CSS; Autoprefixer depois. São dois bônus do PDF."
- **HTML semântico e acessibilidade:** `form` com `label`, `ol` para o histórico, `table` com `caption` no ranking, `aria-live` nas respostas do juiz, gráfico com tabela equivalente, contraste WCAG calculado em `/design`.

---

## 7. Limites e próximos passos (1 minuto)

Falar dos limites **antes** de perguntarem é sinal de senioridade:

- "As estatísticas leem todas as partidas em memória. Com milhões, eu trocaria por uma **aggregation pipeline** do MongoDB ou uma tabela de resumo."
- "Não há autenticação: qualquer um com o id da partida pode chutar nela. O id é aleatório (ObjectId), mas o próximo passo seria um token por partida."
- "O ranking aceita qualquer nome. Em produção, eu filtraria palavrões e limitaria partidas por IP."
- "Faltam testes de integração com Testcontainers (MongoDB real em Docker)."

---

## ❓ Perguntas prováveis (e como responder)

| Pergunta | Caminho da resposta |
| --- | --- |
| Por que validar no front **e** no back? | front: resposta imediata; back: é a fonte da verdade, o front pode ser burlado (Postman, curl) |
| Onde fica a regra de maior/menor? | `Juiz.julgar`, chamado pelo `Arbitro`; o front nunca compara nada |
| Como você garante que o número não vaza? | `PartidaResponse.de` devolve `null` enquanto `EM_ANDAMENTO`; teste `iniciar: ... NÃO devolve o número secreto` |
| Por que `SecureRandom`? | não dá para prever o próximo número a partir dos anteriores; `Random` comum é previsível |
| Por que BigDecimal no `PalpiteRequest`? | para recusar 42.5 com 400; com `int`, o conversor de JSON poderia truncar sem avisar |
| Palpite repetido conta tentativa? | não; é uma premissa assumida e documentada; a regra está no `Arbitro` e coberta por teste |
| Como o ranking desempata? | tentativas, depois segundos, depois quem terminou antes; ordenação feita no MongoDB com índice |
| Usou IA? | sim, e está documentado em `docs/IA.md` (o PDF exige); revisei, testei e sei explicar cada parte |
| O que faria diferente? | autenticação por partida, aggregation nas estatísticas, Testcontainers, WebSocket no ranking |
| E em .NET? | mesma arquitetura: controller → service → regras puras → repository; `[ApiController]`, `ProblemDetails` para erros, xUnit + Moq nos testes |

**Se não souber algo:** "Não sei, mas eu investigaria assim: ...". Nunca invente.

---

## ✅ Checklist do dia

- [ ] Projeto rodando localmente **e** link do deploy aberto (o Render pode estar "dormindo": abra 2 minutos antes)
- [ ] Banco com partidas de exemplo (`POST /api/simulacao/reiniciar?partidas=30`)
- [ ] README aberto nos diagramas
- [ ] IDE aberta em `Arbitro`, `Intervalo`, `PartidaService`, `GlobalExceptionHandler` e `PartidaServiceTest`
- [ ] `Back/requests.http` aberto para mostrar 400, 404, 409 e 422 ao vivo
- [ ] Terminal pronto com `./mvnw test` e `npm test`
- [ ] Capturas de tela como plano B
- [ ] Água, câmera ligada, notificações desligadas

## 🚫 Evite

- Começar pelo código linha a linha ("aqui eu criei uma classe...").
- Dizer "a IA fez essa parte". Diga o que **você** decidiu e por quê.
- Esconder limitações. Assuma e diga como resolveria.
- Falar por 15 minutos sem checar: pergunte "quer que eu aprofunde na API ou nos testes?".

## 🗣️ Frases-modelo

- "A decisão foi **X**, porque **Y**. O custo dessa decisão é **Z**; se o requisito mudasse para **W**, eu faria **V**."
- "Isso está coberto pelo teste `...`, quer que eu mostre?"
- "O PDF pedia **A**; eu assumi **B** porque **C**, e deixei isso escrito no README."
