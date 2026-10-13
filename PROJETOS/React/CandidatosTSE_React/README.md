# Projeto Candidatos TSE (React + Vite) 🗳️

## 📖 Descrição

O **CandidatosTSE_React** é a versão em **React** e **Vite** do projeto [CandidatosTSE (Spring Boot)](https://github.com/joaopauloaramuni/desenvolvimento-e-integracao-de-aplicacoes-web/tree/main/PROJETOS/SpringBoot/CandidatosTSE). Ele lê o CSV de candidatos do TSE (eleições de 2026, MG) e exibe os candidatos em uma **tela única** com filtros por **cargo**, **partido** e **busca por nome/número**, incluindo a foto oficial de cada um.

A tela, o CSS e as regras são os mesmos do projeto Spring. A diferença é **quem faz o trabalho**: no Spring, o servidor lia o CSV e o Thymeleaf montava o HTML; aqui, o **navegador** baixa o CSV, monta a lista em memória e o React desenha os cards. Não existe back-end, chave nem `.env`.

## 🖼️ Capturas de Tela

- **Index**: A tela única exibe o cabeçalho com o título da aplicação e, logo abaixo, o formulário de filtros (busca por nome/número, cargo e partido) com os botões **Filtrar** e **Limpar**. Em seguida, é exibida a contagem de candidatos encontrados e a grade de cards, cada um trazendo a foto oficial do candidato, número, cargo, partido, idade, ocupação, escolaridade e nome civil. Quando a foto não está disponível, um placeholder "Sem foto" é exibido no lugar.

| Index |
| :---: |
| ![Index](https://joaopauloaramuni.github.io/react-imgs/CandidatosTSE_React/imgs/Index.png) |

| Filtro Governador - Exemplo | Filtro Senador - Exemplo |
| :---: | :---: |
| ![Governador](https://joaopauloaramuni.github.io/react-imgs/CandidatosTSE_React/imgs/Governador.png) | ![Senador](https://joaopauloaramuni.github.io/react-imgs/CandidatosTSE_React/imgs/Senador.png) |

| Celular - Busca | Celular - Governador |
| :---: | :---: |
| ![Mobile](https://joaopauloaramuni.github.io/react-imgs/CandidatosTSE_React/imgs/Mobile.png) | ![Mobile2](https://joaopauloaramuni.github.io/react-imgs/CandidatosTSE_React/imgs/Mobile2.png) |

## 🚀 Como rodar

```bash
npm install
unzip images.zip -d public     # descompacta as fotos em public/images/candidatos/
npm run dev
```

No Windows (PowerShell), troque o `unzip` por:

```powershell
Expand-Archive images.zip -DestinationPath public
```

Acesse `http://localhost:5173`.

> 📸 **Sem descompactar o `images.zip` o projeto funciona**, mas todos os cards aparecem com "Sem foto". Se descompactar com o `npm run dev` já rodando, **reinicie** o servidor: a lista de fotos é lida quando o Vite inicia (veja `vite.config.js`).

## 🔁 O que mudou em relação ao Spring Boot

| Spring Boot (Thymeleaf) | React + Vite |
|---|---|
| `model/Candidato.java` | `src/model/Candidato.js` (mesmos campos; `getIdade()` e `getNomeArquivoFoto()` viraram getters `idade` e `nomeArquivoFoto`) |
| `service/CandidatosTseService.java` | `src/services/candidatosTseService.js` (mesmas funções, mesmos nomes) |
| `controller/CandidatosTseController.java` + `@RequestParam` | `src/App.jsx` + `src/hooks/useFiltrosDaUrl.js` (os filtros continuam na URL) |
| `templates/index.html` (Thymeleaf) | `src/App.jsx` + componentes `Filtros` e `CardCandidato` |
| `static/css/style.css` | O mesmo CSS, dividido em `index.css`, `App.css`, `Filtros.css` e `CardCandidato.css` |
| `@PostConstruct` (lê o CSV ao subir o servidor) | `carregarCsv()` chamado pelo hook `useCandidatos` ao abrir a tela (uma vez só) |
| `resources/data/candidatos/*.csv` (classpath) | `public/data/candidatos/*.csv` (baixado com `fetch`) |
| `opencsv` + `InputStreamReader(..., ISO_8859_1)` | `papaparse` + `TextDecoder("iso-8859-1")` |
| `static/images.zip` → `static/images/candidatos/` | `images.zip` → `public/images/candidatos/` |
| `new ClassPathResource(...).exists()` | Lista de fotos gerada pelo plugin do `vite.config.js` (`virtual:fotos-candidatos`) |
| `onerror` com `sem-foto.jpg` | `urlFoto()` já escolhe a `sem-foto.jpg` quando o arquivo não existe |
| Formulário `GET` (a página recarrega) | `onSubmit` + `history.pushState` (a URL muda, a página não recarrega) |

## ⚙️ Como funciona

```text
Navegador ──fetch──▶ /data/candidatos/consulta_cand_2026_MG.csv  (~1 MB, ISO-8859-1)
    │
    ▼
TextDecoder("iso-8859-1") ── bytes → texto com os acentos certos
    │
    ▼
Papa.parse(texto, { delimiter: ";", quoteChar: '"' }) ── texto → linhas e colunas
    │
    ▼
candidatosTseService.js ── linha → Candidato, fotos emprestadas, ordena por nome de urna
    │
    ▼
App.jsx ── filtrar(cargo, partido, texto) ──▶ <Filtros /> + <CardCandidato /> × N
```

- O CSV é lido **uma vez só**: `carregarCsv()` guarda a `Promise` e as próximas chamadas reaproveitam o resultado (inclusive no `StrictMode`, que monta os componentes duas vezes no dev).
- Os filtros ficam na **URL**, igual ao `GET` do Spring: dá para copiar o link, recarregar a página e usar o botão **voltar**.
- As fotos têm `loading="lazy"`: o navegador só baixa as que aparecem na tela.

### Por que o `TextDecoder`?

O TSE publica o CSV em **ISO-8859-1 (Latin-1)**. O `resposta.text()` do `fetch` sempre lê como **UTF-8**, e os acentos viram `�`. Por isso o service lê os **bytes** (`arrayBuffer()`) e decodifica com o charset certo, o mesmo papel do `StandardCharsets.ISO_8859_1` no Java:

```js
const bytes = await resposta.arrayBuffer();
const texto = new TextDecoder("iso-8859-1").decode(bytes);
```

### Como o navegador sabe quais fotos existem?

No Spring, o service perguntava ao classpath: `new ClassPathResource("static/images/candidatos/FMG..._div.jpg").exists()`. O navegador não enxerga o disco, e testar 1.800 fotos com `fetch` seria lento. Então o `vite.config.js` tem um pequeno plugin que lê a pasta `public/images/candidatos/` **uma vez** e entrega a lista como um módulo:

```js
import fotosDisponiveis from "virtual:fotos-candidatos"; // ["FMG130002538303_div.jpg", ...]
```

Com isso, `fotoExisteNoDisco()` virou um `Set.has(...)`, e a lógica de `resolverFotosPorCpf()` continua igual à do Java.

## 🛠️ `candidatosTseService.js`

Responsável por carregar, tratar e filtrar os dados dos candidatos.

| Função | O que faz |
|---|---|
| `carregarCsv()` | Baixa o CSV uma única vez (o equivalente ao `@PostConstruct`), popula a lista de candidatos em memória e ordena por nome de urna. |
| `resolverFotosPorCpf()` | Para candidatos sem foto própria (ex.: titular de Senador), tenta reaproveitar a foto de outra candidatura da mesma pessoa (mesmo nome + número), já que o TSE às vezes mascara o CPF nesses casos. |
| `fotoExisteNoDisco()` | Verifica se o arquivo `FMG<sqCandidato>_div.jpg` existe em `public/images/candidatos/`. |
| `urlFoto()` | Devolve o endereço da foto do candidato, a `sem-foto.jpg` quando não há foto, ou `null` se o `images.zip` não foi descompactado. |
| `filtrar()` | Filtra a lista por cargo, partido e/ou texto (nome, nome de urna ou número). Qualquer parâmetro vazio é ignorado. |
| `listarCargos()` / `listarPartidos()` | Retornam os valores distintos usados para popular os `<select>` de filtro na tela. |
| `listarTodos()` | Retorna a lista completa de candidatos. |

## 🎮 Filtros na URL (o antigo `CandidatosTseController`)

| Parâmetro | Exemplo | Regra |
|---|---|---|
| `cargo` | `GOVERNADOR` | Compara com `cargo` (ignora maiúsculas/minúsculas). Vazio = todos. |
| `partido` | `PT` | Compara com `siglaPartido`. Vazio = todos. |
| `texto` | `ana` ou `1240` | Procura em nome civil, nome de urna e número. Vazio = todos. |

Exemplo de URL com todos os filtros:

```
http://localhost:5173/?cargo=DEPUTADO+FEDERAL&partido=PT&texto=ana
```

O hook `useFiltrosDaUrl` lê esses parâmetros ao abrir a tela, escreve na URL ao clicar em **Filtrar** (`history.pushState`) e acompanha o **voltar/avançar** do navegador (`popstate`). O formulário só aplica o filtro no clique, como no `GET` do Spring.

## 🧩 `Candidato` (model)

Representa uma linha do CSV do TSE, já traduzida para os campos usados na tela (nome, cargo, partido, foto, situação da candidatura, idade calculada a partir da data de nascimento etc.). É o objeto que sai do service e que o `CardCandidato` usa diretamente para desenhar cada card, mantendo a leitura do CSV isolada do restante da aplicação.

- `nomeArquivoFoto`: `FMG<sqCandidato>_div.jpg` (ou o `sqCandidatoParaFoto`, quando a foto é emprestada).
- `idade`: mesma conta do `Period.between(nascimento, hoje).getYears()`; devolve `-1` para datas como `#NULO`.

## 📂 Estrutura do Projeto

```text
📁 CandidatosTSE_React
│
├── 📁 imgs                              └── Capturas de tela usadas neste README
│
├── 📁 public
│   ├── 📊 data
│   │   └── 📁 candidatos
│   │       └── consulta_cand_2026_MG.csv └── Base de dados oficial do TSE (candidatos de MG, 2026)
│   ├── 🖼️ images                        └── Criada ao descompactar o images.zip (fica fora do Git)
│   │   └── 📁 candidatos                └── Fotos oficiais (padrão FMG<sq>_div.jpg) + sem-foto.jpg
│   └── pucminas-logo.png                └── Favicon
│
├── 📁 src
│   ├── 🧩 model
│   │   └── Candidato.js                 └── Representa um candidato lido do CSV do TSE
│   │
│   ├── ⚙️ services
│   │   └── candidatosTseService.js      └── Carrega, trata e filtra os candidatos
│   │
│   ├── 🪝 hooks
│   │   ├── useCandidatos.js             └── Carrega o CSV ao abrir a tela
│   │   └── useFiltrosDaUrl.js           └── Filtros na URL (?cargo=...&partido=...&texto=...)
│   │
│   ├── 🎨 components
│   │   ├── Filtros/                     └── Formulário de filtros + Filtros.css
│   │   └── CardCandidato/               └── Card com foto e dados + CardCandidato.css
│   │
│   ├── App.jsx                          └── Tela única (o antigo controller + index.html)
│   ├── App.css
│   ├── index.css
│   └── main.jsx
│
├── 📦 images.zip                        └── Fotos dos candidatos (descompacte em public/)
├── 📄 vite.config.js                    └── Plugin que lista as fotos existentes
└── 📄 package.json
```

## ☁️ Deploy na Vercel

Importe o repositório em [vercel.com/new](https://vercel.com/new) (preset **Vite**) e clique em **Deploy**. Não há variáveis de ambiente para configurar.

> ⚠️ A pasta `public/images/` está no `.gitignore` (são ~1.800 fotos), então, por padrão, o deploy sobe **sem fotos**. Para publicar com as fotos, apague a linha `public/images/` do `.gitignore` e faça o commit da pasta `public/images/candidatos/`.

## 📦 Dependências

```json
"dependencies": {
  "papaparse": "^5.7.0",
  "react": "^19.2.8",
  "react-dom": "^19.2.8"
}
```

- [`papaparse`](https://www.papaparse.com/): leitura do CSV do TSE (separador `;`, aspas `"`). Faz o papel do `opencsv`.
- O charset `ISO-8859-1` é tratado pelo `TextDecoder`, nativo do navegador.

## 🧪 Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Testa o build localmente |
| `npm run lint` | Lint com o oxlint (padrão do template atual do Vite) |

## 🔗 Urls do projeto

http://localhost:5173/

http://localhost:5173/?cargo=GOVERNADOR

http://localhost:5173/?cargo=SENADOR

## 📚 Documentação e links úteis

- [Dados Abertos do TSE: Candidatos 2026](https://dadosabertos.tse.jus.br/dataset/candidatos-2026)
- [Papa Parse](https://www.papaparse.com/docs)
- [TextDecoder (MDN)](https://developer.mozilla.org/pt-BR/docs/Web/API/TextDecoder)
- [History API: pushState (MDN)](https://developer.mozilla.org/pt-BR/docs/Web/API/History/pushState)
- [Documentação do React](https://react.dev/)
- [Documentação do Vite](https://vite.dev/)
- [Plugins e módulos virtuais no Vite](https://vite.dev/guide/api-plugin#virtual-modules-convention)

## 📄 Licença
Este projeto está licenciado sob a MIT License.
