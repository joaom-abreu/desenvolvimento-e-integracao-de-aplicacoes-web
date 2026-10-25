# 🤖 Uso de IA no projeto (rules, memórias e prompts)

O PDF do case lista como entregável **opcional** o "Markdown de rules, memórias e prompts que foram utilizadas na IA". Este arquivo cumpre esse papel. **Adapte com o que você realmente usou**: o avaliador quer ver *como* você trabalha com a ferramenta, e não esconder que ela foi usada.

## Ferramenta

- Assistente de IA conversacional (Claude) para gerar a base do projeto, revisar código e escrever a documentação.

## Rules (regras que guiaram a IA)

1. **Stack fixa:** back-end Spring Boot (Java 21) com pacotes `controller`, `service`, `repository` (MongoDB), `model`, `dto`, `config` e `exception`; front-end React + Vite.
2. **Didático:** código e comentários em português, nomes claros, pensando em estagiários e devs júnior.
3. **Algoritmo isolado:** o pacote `algoritmo` não pode depender de Spring nem de banco (fácil de testar).
4. **Caixeiro viajante recursivo**, com o vizinho mais próximo em **recursão em cauda**, explicando a limitação da JVM (sem TCO).
5. **Erros claros:** toda regra de negócio quebrada vira 422 com mensagem pronta para a tela.
6. **Testes obrigatórios:** JUnit 5 + Mockito no back, Vitest + Testing Library no front, e um teste de carga.
7. **Identidade dti:** logo, cores (`#000066`, `#40E6F2`, `#FC6D3A`, `#3038D5`) e fontes (Red Hat Display/Text) tiradas do PDF.
8. **Pronto para deploy:** Dockerfiles, `vercel.json`, `render.yaml` e variáveis de ambiente (sem segredo no código).

## Memória / contexto fornecido

- O PDF do processo seletivo (`docs/DTI_Dev.pdf`).
- O logo oficial da dti.
- Um projeto de referência (AraCoffee) com o padrão de README, de página `/design` e de deploy Vercel + Render.

## Prompts principais

> Resolver o case do PDF com front React + Vite e back-end Spring Boot. Caixeiro viajante recursivo (recursão em cauda); API REST com controller, service, repository (Mongo), model, dto, config, exception; MongoDB Atlas; testes com Mockito no back e testes no front; testes de carga com k6; dashboard; diagrama de estados; README completo e didático com imagens; deploy Vercel + Render com Dockerfile; design system com logo, cores e fontes da dti e uma página de design system; diagramas de componentes e de implantação; um roteiro de como explicar o projeto numa entrevista.

Prompts de acompanhamento usados durante o desenvolvimento (exemplos):

- "Explique por que a JVM não otimiza recursão em cauda e como converter para laço."
- "Escreva um teste com Mockito que garanta que um pacote acima da capacidade não é salvo."
- "Qual a diferença entre 400 e 422 nesta API?"
- "Gere um cenário k6 que crie pedidos válidos fora das zonas de exclusão."

## O que foi revisado/validado por mim

- [ ] Rodei `./mvnw test` e `npm test` e todos passaram.
- [ ] Li e entendi `PlanejadorViagens`, `CaixeiroViajante`, `MapaAereo` e `SimulacaoService`.
- [ ] Testei os erros 400/404/422 pelo `Back/requests.http`.
- [ ] Rodei o `k6 run load-tests/smoke.js`.
- [ ] Sei explicar cada decisão do [ROTEIRO.md](../ROTEIRO.md).
