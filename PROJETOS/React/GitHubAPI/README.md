# Projeto GitHubAPI (React + Vite) 🐙

## 📖 Descrição

Painel do seu perfil no **GitHub**, feito com **React** e **Vite** e lido ao vivo da **GitHub API**. Tem uma caixa de busca para ver o perfil de qualquer usuário.

São **cinco componentes independentes**: use o painel completo ou só a parte que quiser no **seu portfólio**.

| Componente | O que mostra |
| --- | --- |
| `<GitHubProfileCard />` | Foto, nome, bio, empresa, cidade, site, seguidores e "no GitHub desde" |
| `<GitHubStats />` | Repositórios, estrelas recebidas, forks e seguidores |
| `<GitHubContributions />` | Calendário de contribuições do último ano (os "quadradinhos"), sequência atual, maior sequência e melhor dia |
| `<GitHubLanguages />` | Linguagens mais usadas (linguagem principal de cada repositório) |
| `<GitHubRepos />` | Cards dos repositórios, com filtro por linguagem, ordenação e "Ver mais" |
| `<GitHubDashboard />` | Todos os anteriores + busca de usuário |

## 🖼️ Capturas de Tela

| Desktop | Celular |
| :---: | :---: |
| ![Home](https://joaopauloaramuni.github.io/react-imgs/GitHubAPI/imgs/Home.png) | ![Mobile](https://joaopauloaramuni.github.io/react-imgs/GitHubAPI/imgs/Mobile.png) |

## 🚀 Como rodar

```bash
npm install
cp .env.example .env.local   # opcional, mas recomendado: GITHUB_TOKEN
npm run dev
```

Acesse `http://localhost:5173` e troque o usuário em `src/config/githubConfig.js`:

```js
USERNAME: "seu-usuario-do-github",
```

> Sem token o projeto funciona, mas o GitHub libera só **60 chamadas por hora por IP**. Numa rede de faculdade (todo mundo com o mesmo IP) esse limite acaba rápido. Com token são **5.000 por hora**.

## 🔑 Como criar o token do GitHub (fine-grained, só leitura)

1. Entre no GitHub e abra [github.com/settings/personal-access-tokens](https://github.com/settings/personal-access-tokens) (**Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens**).
2. Clique em **Generate new token**.
3. Preencha:
   - **Token name**: `portfolio-github-api`
   - **Expiration**: 90 dias (ou o que preferir; anote a data para renovar)
   - **Resource owner**: o seu usuário
   - **Repository access**: **Public repositories** (somente leitura de repositórios públicos)
4. Não precisa marcar nenhuma permissão extra. Clique em **Generate token**.
5. **Copie o token agora** (começa com `github_pat_`): o GitHub não mostra de novo.

> ⚠️ Mesmo só de leitura, o token é **secreto**: ele gasta a sua cota da API. Nunca coloque no código nem no GitHub.

## 🔐 Configurando o `.env.local`

O `.env.local` guarda as variáveis de ambiente **só na sua máquina**: ele está no `.gitignore` e **não vai para o GitHub**.

1. Copie o modelo:

   ```bash
   cp .env.example .env.local
   ```

2. Preencha:

   ```properties
   GITHUB_TOKEN=github_pat_xxxxxxxxxxxxxxxxxxxxxx
   ```

3. **Reinicie** o `npm run dev`.

> 💡 **Por que não `VITE_GITHUB_TOKEN`?** Tudo que começa com `VITE_` vai **dentro do JavaScript** do navegador, e qualquer visitante consegue ler. Sem o prefixo, o token é lido **só no servidor**: pelo `vite.config.js` no `npm run dev` e pela **Vercel Function** `api/github.js` em produção.

## ☁️ Deploy na Vercel (variável de ambiente)

1. Suba o projeto para um repositório no GitHub.
2. Em [vercel.com/new](https://vercel.com/new), clique em **Import** no repositório (preset **Vite**).
3. Abra **Environment Variables** e cadastre:

   | Key | Value |
   | --- | --- |
   | `GITHUB_TOKEN` | `github_pat_...` |

4. Clique em **Deploy**.

Se o projeto já estiver publicado: **Settings** → **Environment Variables** → adicione `GITHUB_TOKEN` (marque **Production**, **Preview** e **Development**) → **Save** → **Deployments** → três pontinhos do último deploy → **Redeploy**.

> ⚠️ Na Vercel o token é ainda mais importante: sem ele, todas as chamadas saem dos IPs da Vercel, que são compartilhados com outros sites, e o limite de 60/hora acaba quase na hora.

## ⚙️ Como funciona

```text
Navegador ──GET /api/github?resource=profile&username=...──▶ vite.config.js (dev) ou api/github.js (Vercel)
                                                                     │ + GITHUB_TOKEN (se houver)
                                                                     ▼
                                    profile       → GET https://api.github.com/users/:username
                                    repos         → GET https://api.github.com/users/:username/repos
                                    contributions → GraphQL contributionsCollection (com token)
                                                    ou github-contributions-api.jogruber.de (sem token)
```

- O servidor só aceita os três recursos acima e um usuário válido: a rota não vira uma "porta aberta" para gastar o token.
- As respostas ficam **10 minutos** no cache da CDN da Vercel.
- No navegador, cada usuário/recurso é buscado **uma vez** (cache em memória): os 5 componentes dividem a mesma chamada de repositórios.
- O calendário de contribuições usa a **GraphQL API oficial** quando há token. Sem token, usa a API pública da comunidade [github-contributions-api](https://github.com/grubersjoe/github-contributions-api).

## 🧩 Usando no seu projeto

Copie para o seu projeto React + Vite:

```text
api/_github.js                    → lógica (servidor)
api/github.js                     → Vercel Function
src/config/githubConfig.js        → seu usuário e opções
src/services/githubService.js     → fetch para /api/github
src/components/GitHub/            → componentes + CSS
```

Junte o plugin `githubApi(env)` ao seu `vite.config.js` (veja o deste projeto) e use:

```jsx
import GitHubDashboard from "./components/GitHub/GitHubDashboard";
import GitHubRepos from "./components/GitHub/GitHubRepos";
import GitHubContributions from "./components/GitHub/GitHubContributions";

<GitHubDashboard />                                  {/* tudo, com busca */}
<GitHubRepos username="joaopauloaramuni" />          {/* só os repositórios */}
<GitHubContributions username="joaopauloaramuni" />  {/* só o calendário */}
```

Opções em `src/config/githubConfig.js`:

| Opção | Padrão | O que faz |
| --- | --- | --- |
| `USERNAME` | `"joaopauloaramuni"` | Usuário exibido ao abrir a página |
| `REPOS_PER_PAGE` | `6` | Repositórios antes do "Ver mais" |
| `HIDE_FORKS` / `HIDE_ARCHIVED` | `true` / `false` | Esconde forks / arquivados |
| `MAX_LANGUAGES` | `8` | Linguagens no gráfico (o resto vira "Outras") |
| `ALLOW_SEARCH` | `true` | Mostra a busca de usuário |

## 📂 Estrutura do Projeto

```text
📁 GitHubAPI
│
├── 📁 api
│   ├── _github.js       └── Chama a GitHub API (REST + GraphQL) com o token
│   └── github.js        └── Vercel Function: GET /api/github
│
├── 📁 imgs              └── Capturas de tela usadas neste README
├── 📁 public            └── pucminas-logo.png (favicon)
│
├── 📁 src
│   ├── 📁 assets/images └── pucminas-logo.png
│   │
│   ├── 🧩 components
│   │   ├── PageLayout/                └── Card da página com a faixa azul (logo PUC + logo da API)
│   │   └── GitHub/
│   │       ├── GitHubDashboard.jsx    └── Busca + todos os componentes
│   │       ├── GitHubProfileCard.jsx  └── Perfil
│   │       ├── GitHubStats.jsx        └── Indicadores
│   │       ├── GitHubContributions.jsx└── Calendário de contribuições
│   │       ├── GitHubLanguages.jsx    └── Linguagens
│   │       ├── GitHubRepos.jsx        └── Repositórios
│   │       ├── useGitHub.js           └── Hook de carregamento + formatação
│   │       ├── languageColors.js      └── Cor de cada linguagem (GitHub Linguist)
│   │       └── GitHub.css
│   │
│   ├── ⚙️ config/githubConfig.js
│   ├── 🛠️ services/githubService.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── 📄 .env.example
├── 📄 vite.config.js    └── Atende /api/github no npm run dev
└── 📄 package.json
```

## 📦 Dependências

```json
"dependencies": {
  "react": "^19.2.8",
  "react-dom": "^19.2.8",
  "react-icons": "^5.7.0"
}
```

- [`react-icons`](https://react-icons.github.io/react-icons/): ícones (inclusive o logo do GitHub na faixa azul)
- Nenhuma biblioteca para chamar a API: só `fetch`.

## 🧪 Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento (com a rota `/api/github`) |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Testa o build localmente (também atende `/api/github`) |
| `npm run lint` | Lint com o oxlint (padrão do template atual do Vite) |

## 📄 Licença
Este projeto está licenciado sob a MIT License.
