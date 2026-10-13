# Projeto Candidatos TSE 2: Perfil dos Candidatos (React + Vite) 🗳️

## 📖 Descrição

O **CandidatosTSE_2_React** é a versão em **React** e **Vite** do projeto [CandidatosTSE_2 (Spring Boot)](https://github.com/joaopauloaramuni/desenvolvimento-e-integracao-de-aplicacoes-web/tree/main/PROJETOS/SpringBoot/CandidatosTSE_2). Ele lê o CSV de candidatos do TSE (eleições de 2026, MG) e exibe o **perfil** dos candidatos em uma tela única, com filtros por **gênero**, **escolaridade** e **faixa etária**, incluindo a foto oficial de cada um.

A tela, o CSS e as regras são os mesmos do projeto Spring. A diferença é **quem faz o trabalho**: no Spring, o servidor lia o CSV e o Thymeleaf montava o HTML; aqui, o **navegador** baixa o CSV, monta a lista em memória e o React desenha os cards. Não existe back-end, chave nem `.env`.

## 🖼️ Capturas de Tela

- **Index**: A tela é dividida em duas colunas. À esquerda fica o painel de filtros: gênero (botões de opção), escolaridade (lista de seleção), faixa etária (idade mínima e máxima) e os botões **Filtrar** e **Limpar**. À direita aparecem a contagem de candidatos encontrados e a lista de cards horizontais, cada um com a foto oficial, nome de urna, número, cargo, partido, etiquetas de gênero e idade, escolaridade e ocupação. Em telas estreitas, o painel de filtros vai para cima da lista.

| Index |
| :---: |
| ![Index](https://joaopauloaramuni.github.io/react-imgs/CandidatosTSE_2_React/imgs/Index.png) |

| Filtro: feminino, superior completo, 30 a 45 anos | Celular |
| :---: | :---: |
| ![Filtro](https://joaopauloaramuni.github.io/react-imgs/CandidatosTSE_2_React/imgs/Filtro.png) | ![Mobile](https://joaopauloaramuni.github.io/react-imgs/CandidatosTSE_2_React/imgs/Mobile.png) |

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
| `templates/index.html` (Thymeleaf) | `src/App.jsx` + componentes `PainelFiltros` e `CardCandidato` |
| `static/css/style.css` | O mesmo CSS, dividido em `index.css`, `App.css`, `PainelFiltros.css` e `CardCandidato.css` |
| `@PostConstruct` (lê o CSV ao subir o servidor) | `carregarCsv()` chamado pelo hook `useCandidatos` ao abrir a tela (uma vez só) |
| `resources/data/candidatos/*.csv` (classpath) | `public/data/candidatos/*.csv` (baixado com `fetch`) |
| `opencsv` + `InputStreamReader(..., ISO_8859_1)` | `papaparse` + `TextDecoder("iso-8859-1")` |
| `static/images.zip` → `static/images/candidatos/` | `images.zip` → `public/images/candidatos/` |
| `new ClassPathResource(...).exists()` | Lista de fotos gerada pelo plugin do `vite.config.js` (`virtual:fotos-candidatos`) |
| `@RequestParam Integer idadeMin` | `paraInteiro(filtros.idadeMin)` no `App.jsx` (vazio ou inválido vira `null`) |
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
App.jsx ── filtrarPerfil(genero, escolaridade, idadeMin, idadeMax)
    │
    ▼
<PainelFiltros /> (coluna da esquerda) + <CardCandidato /> × N (coluna da direita)
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
| `resolverFotosPorCpf()` | Para candidatos sem foto própria (ex.: titular de Senador), tenta reaproveitar a foto de outra candidatura da mesma pessoa (mesmo nome + número). |
| `fotoExisteNoDisco()` | Verifica se o arquivo `FMG<sqCandidato>_div.jpg` existe em `public/images/candidatos/`. |
| `urlFoto()` | Devolve o endereço da foto do candidato, a `sem-foto.jpg` quando não há foto, ou `null` se o `images.zip` não foi descompactado. |
| `filtrarPerfil()` | Filtra a lista por gênero, escolaridade e/ou faixa etária (idade mínima e máxima). Qualquer parâmetro vazio é ignorado. |
| `listarGeneros()` / `listarEscolaridades()` | Retornam os valores distintos usados para montar os botões de opção de gênero e o `<select>` de escolaridade. |
| `listarTodos()` | Retorna a lista completa de candidatos. |
| `filtrar()` / `listarCargos()` / `listarPartidos()` | Filtros por cargo, partido e texto do projeto anterior. *Não são usados neste projeto.* |

## 🎮 Filtros na URL (o antigo `CandidatosTseController`)

O `App.jsx` lê os parâmetros opcionais `genero`, `escolaridade`, `idadeMin` e `idadeMax`, chama `filtrarPerfil()` e envia as opções dos filtros (`listarGeneros()` e `listarEscolaridades()`) para o `PainelFiltros`, que mantém marcados os valores atuais.

Exemplo de URL com todos os filtros:

```
http://localhost:5173/?genero=FEMININO&escolaridade=SUPERIOR+COMPLETO&idadeMin=30&idadeMax=45
```

### Parâmetros

| Parâmetro | Tipo | Exemplo | Regra |
|---|---|---|---|
| `genero` | `string` | `FEMININO` | Compara com `genero` (ignora maiúsculas/minúsculas). Vazio = todos. |
| `escolaridade` | `string` | `SUPERIOR COMPLETO` | Compara com `grauInstrucao`. Vazio = todas. |
| `idadeMin` | `number` | `30` | Mantém quem tem `idade >= idadeMin`. |
| `idadeMax` | `number` | `45` | Mantém quem tem `idade <= idadeMax`. |

> Candidatos com data de nascimento inválida têm `idade === -1` e ficam de fora sempre que algum filtro de idade é usado.

O hook `useFiltrosDaUrl` lê esses parâmetros ao abrir a tela, escreve na URL ao clicar em **Filtrar** (`history.pushState`) e acompanha o **voltar/avançar** do navegador (`popstate`). Parâmetros vazios não entram na URL.

### O que cada parte recebe

| Componente / prop | Conteúdo |
|---|---|
| `candidatos` (no `App.jsx`) | Lista filtrada; o tamanho dela é a contagem exibida |
| `<PainelFiltros generos>` | `listarGeneros()` (para os botões de opção) |
| `<PainelFiltros escolaridades>` | `listarEscolaridades()` (para o `<select>`) |
| `<PainelFiltros filtros>` | Valores atuais do filtro, lidos da URL (`""` quando não informados) |
| `<CardCandidato candidato>` | Um `Candidato` |

## 🧩 `Candidato` (model)

Representa uma linha do CSV do TSE, já traduzida para os campos usados na tela (nome, cargo, partido, foto, gênero, escolaridade, ocupação, idade calculada a partir da data de nascimento etc.). É o objeto que sai do service e que o `CardCandidato` usa diretamente para desenhar cada card.

- `nomeArquivoFoto`: `FMG<sqCandidato>_div.jpg` (ou o `sqCandidatoParaFoto`, quando a foto é emprestada).
- `idade`: mesma conta do `Period.between(nascimento, hoje).getYears()`; devolve `-1` para datas como `#NULO`.

## 📂 Estrutura do Projeto

```text
📁 CandidatosTSE_2_React
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
│   │   └── useFiltrosDaUrl.js           └── Filtros na URL (?genero=...&idadeMin=...)
│   │
│   ├── 🎨 components
│   │   ├── PainelFiltros/               └── Painel lateral de filtros + PainelFiltros.css
│   │   └── CardCandidato/               └── Card horizontal com foto e etiquetas + CardCandidato.css
│   │
│   ├── App.jsx                          └── Tela única (o antigo controller + index.html)
│   ├── App.css                          └── Cabeçalho e layout em duas colunas
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

http://localhost:5173/?genero=FEMININO

http://localhost:5173/?genero=FEMININO&escolaridade=SUPERIOR+COMPLETO&idadeMin=30&idadeMax=45

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
