# 🤖 Uso de IA no projeto

O PDF do teste diz: *"Você poderá utilizar ferramentas de IA para a construção do seu código, mas para isso precisará explicar onde e como foi utilizado no projeto. Caso não utilize, deixe claro que não utilizou."* Este arquivo cumpre esse requisito. **Adapte com o que você realmente usou**: o avaliador quer ver *como* você trabalha com a ferramenta, e não que ela foi escondida.

## Ferramenta

- Assistente de IA conversacional (Claude) para gerar a base do projeto, revisar o código, escrever testes e documentação.

## Onde a IA foi usada

| Parte do projeto | Como a IA ajudou | O que foi decidido / revisado por pessoa |
| --- | --- | --- |
| Pacote `jogo` (Juiz, Intervalo, Arbitro, Desempenho) | primeira versão das classes e dos testes | as regras (repetido não conta, 409 × 422, dica de palpite desperdiçado) |
| Controllers, DTOs, `GlobalExceptionHandler` | código seguindo o padrão do projeto de referência (DronesDTI) | rotas REST e códigos HTTP |
| Front-end (páginas, Tabuleiro, SCSS) | componentes, estilos e testes com Testing Library | layout do tabuleiro, textos da interface |
| Testes (JUnit 5, Mockito, MockMvc, Vitest) | escrita dos casos | quais cenários importam |
| README, ROTEIRO e diagramas | redação e diagramas Mermaid | conteúdo revisado e conferido com o código |
| k6, Docker, CI, deploy | arquivos de configuração | ajustados para Java 17 |

## Rules (regras que guiaram a IA)

1. **Stack fixa:** back-end Spring Boot (java 17) com pacotes `controller`, `service`, `repository` (MongoDB), `model`, `dto`, `config` e `exception`; front-end React + Vite. O PDF pede .NET; esta versão usa Java por decisão do projeto (ver README, "Decisões de projeto").
2. **Regra no back-end:** maior, menor ou acertou é calculado **só** no servidor; o número sorteado nunca vai para o navegador enquanto a partida está em andamento.
3. **Regras isoladas:** o pacote `jogo` não pode depender de Spring nem de banco (fácil de testar).
4. **Erros claros:** 400 (formato), 404 (não existe), 409 (partida encerrada), 422 (regra do jogo), sempre com uma `mensagem` pronta para a tela.
5. **Testes obrigatórios:** JUnit 5 + Mockito + MockMvc no back, Vitest + Testing Library no front.
6. **HTML semântico e acessibilidade**, como pede o PDF: `header`, `nav`, `main`, `section`, `form`, `label`, `ol`, `table`, `figure`, `aria-live`.
7. **Sem bibliotecas de componentes** (preferência do PDF): gráficos em SVG feitos à mão.
8. **Identidade dti** igual ao projeto DronesDTI: logo, cores, fontes Red Hat e página `/design`.
9. **Bônus do PDF:** SCSS (pré-processador), Autoprefixer (pós-processador), API RESTful, ranking salvo no banco, testes no front e no back.

## Memória / contexto fornecido

- O PDF do teste (`docs/Teste dti - Rackers.pdf`).
- Uma tentativa anterior do teste em .NET + React (usada só para entender o enunciado).
- O projeto de referência **DronesDTI** (mesmo padrão de README, ROTEIRO, design system, deploy e testes).
- O logo oficial da dti (pasta `public` do DronesDTI).

## Prompt principal

> Vamos resolver o projeto em anexo nos mesmos moldes do projeto de exemplo DronesDTI. Ou seja, React e Vite no front-end, Spring Boot no back-end, java 17 e banco de dados MongoDB Atlas. Faça o mesmo padrão de README, com imagens no GitHub Pages nas URLs das imagens, e também um ROTEIRO.md de apresentação do projeto. Coloque o arquivo Teste dti - Rackers.pdf em uma pasta docs. Use a logo da dti e faça o design system igual ao do DronesDTI. Dê um nome para o novo projeto (não precisa usar .NET como o projeto pede).

Prompts de acompanhamento (exemplos):

- "Prove com um teste que a busca binária acerta qualquer número de 1 a 100 em no máximo 7 tentativas."
- "Como recusar 42.5 com 400 sem o Jackson truncar para 42?"
- "Qual a diferença entre 409 e 422 neste jogo?"
- "Como impedir que o número sorteado apareça no F12?"
- "Escreva um cenário k6 em que cada usuário jogue uma partida inteira sem saber o número."

## O que foi revisado/validado por mim

- [ ] Rodei `./mvnw test` e `npm test` e todos passaram.
- [ ] Li e entendi `Arbitro`, `Intervalo`, `Desempenho`, `PartidaService` e `GlobalExceptionHandler`.
- [ ] Testei os erros 400/404/409/422 pelo `Back/requests.http`.
- [ ] Joguei pelo navegador, inclusive dando F5 no meio da partida.
- [ ] Rodei `k6 run load-tests/smoke.js`.
- [ ] Sei explicar cada decisão do [ROTEIRO.md](../ROTEIRO.md).
