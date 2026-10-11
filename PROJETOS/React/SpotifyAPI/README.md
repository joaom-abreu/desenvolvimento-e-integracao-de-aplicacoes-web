# Projeto SpotifyAPI (React + Vite) 🎧

## 📖 Descrição

Painel com a **sua música no Spotify**, feito com **React** e **Vite** e lido ao vivo da **Web API do Spotify**: o que está tocando agora, as músicas e os artistas mais ouvidos, as tocadas recentemente e o **player oficial** embutido.

São duas abas:

- **Web API**: tudo lido da API oficial, com as chaves guardadas no servidor (nunca no navegador)
  - **🟢 Tocando agora**: capa, música, artista, álbum e a barra de progresso andando (atualiza sozinho a cada 30 s). Parado, mostra a última música que você ouviu
  - **Mais ouvidas** em 3 períodos: 4 semanas, 6 meses e 1 ano
  - **Top artistas** com foto e gêneros
  - **Tocadas recentemente** ("há 5 min", "ontem"...)
  - **Player**: clique na capa de qualquer música para tocar no player oficial do Spotify
- **Cards prontos**: os mesmos cards do meu portfólio, imagens geradas por serviços da comunidade a partir do seu id do Spotify (sem código e sem chave)

A ideia é que você copie o componente `<SpotifyDashboard />` (ou só o `<NowPlaying />`) para o **seu portfólio** ou para qualquer outro projeto React.

## 🖼️ Capturas de Tela

| Desktop | Celular |
| :---: | :---: |
| ![Home](https://joaopauloaramuni.github.io/react-imgs/SpotifyAPI/imgs/Home.png) | ![Mobile](https://joaopauloaramuni.github.io/react-imgs/SpotifyAPI/imgs/Mobile.png) |

> As capturas usam uma **conta de demonstração** (capas geradas, músicas de exemplo). Com as suas chaves, aparecem as suas músicas e as capas reais.

## 🚀 Como rodar

```bash
npm install
cp .env.example .env.local   # depois preencha as chaves (passo a passo abaixo)
npm run dev
```

Acesse **`http://127.0.0.1:5173`** (veja abaixo por que `127.0.0.1` e não `localhost`).

> Sem o `.env.local` o projeto abre normalmente, mas o painel mostra o aviso **"Configure SPOTIFY_CLIENT_ID..."**. A aba **Cards prontos** funciona sem chave nenhuma.

## 🔑 Passo 1: criar o app no Spotify

1. Entre em [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard) com a sua conta do Spotify e aceite os termos.
2. Clique em **Create app** e preencha:
   - **App name**: `Painel React PUC`
   - **App description**: `Projeto didático com a Web API`
   - **Redirect URIs**: `http://127.0.0.1:5173/api/spotify/callback` (clique em **Add**)
   - **Which API/SDKs are you planning to use?**: marque **Web API**
3. Aceite os termos e clique em **Save**.
4. No app, abra **Settings**: copie o **Client ID** e clique em **View client secret** para copiar o **Client secret**.

> ⚠️ **`localhost` não é aceito.** Desde 2025 o Spotify só aceita endereços de loopback com o IP (`http://127.0.0.1:PORTA`) no Redirect URI. Por isso o `vite.config.js` deste projeto escuta em `127.0.0.1`, e o login (passo 3) precisa ser aberto nesse endereço.

> ⚠️ **Development Mode (regras de 2026):** todo app novo nasce em *Development Mode*. Desde **fevereiro/março de 2026** o Spotify exige que o **dono do app tenha conta Premium**, limita cada app a **5 usuários** (cadastrados em **Settings → User Management**) e cada desenvolvedor a **1 Client ID** em Development Mode. Como o painel mostra só a **sua** música, você é o único usuário e isso basta.

## 🔐 Passo 2: configurar o `.env.local`

O `.env.local` guarda as variáveis de ambiente **só na sua máquina**: ele está no `.gitignore` e **não vai para o GitHub**.

```bash
cp .env.example .env.local
```

```properties
SPOTIFY_CLIENT_ID=0123456789abcdef0123456789abcdef
SPOTIFY_CLIENT_SECRET=fedcba9876543210fedcba9876543210
SPOTIFY_REFRESH_TOKEN=          # fica vazio por enquanto (passo 3)
```

Reinicie o `npm run dev` (o Vite só lê o `.env.local` quando inicia).

> 💡 **Por que as variáveis não começam com `VITE_`?** Tudo que começa com `VITE_` é colocado **dentro do JavaScript** que vai para o navegador, e qualquer visitante consegue ler. Sem o prefixo, as chaves são lidas **só no servidor**: pelo `vite.config.js` no `npm run dev` e pela **Vercel Function** `api/spotify.js` em produção.

## 🎟️ Passo 3: gerar o refresh token (uma vez só)

Os dados de "tocando agora", "mais ouvidas" e "tocadas recentemente" são **da sua conta**: o Spotify precisa que você faça login uma vez e autorize o app. O próprio projeto faz isso:

1. Com o `npm run dev` rodando, abra **[http://127.0.0.1:5173/api/spotify/login](http://127.0.0.1:5173/api/spotify/login)**.
2. Faça login no Spotify e clique em **Concordo** (o app pede só leitura: `user-read-currently-playing`, `user-read-recently-played` e `user-top-read`).
3. O Spotify volta para `/api/spotify/callback`, que troca o código pelo **refresh token** e mostra a linha pronta para copiar:

   ![Refresh token](https://joaopauloaramuni.github.io/react-imgs/SpotifyAPI/imgs/RefreshToken.png)

4. Cole no `.env.local`, reinicie o `npm run dev` e pronto.

O refresh token **não expira** (a não ser que você remova o acesso do app em [spotify.com/account/apps](https://www.spotify.com/account/apps)). Com ele, o servidor pede um **access token** novo (que vale 1 hora) sempre que precisa.

> 🔒 As rotas `/api/spotify/login` e `/api/spotify/callback` existem **só no `npm run dev`**. Na Vercel elas não são publicadas: ninguém consegue trocar o token do seu site.

## ☁️ Deploy na Vercel (variáveis de ambiente)

1. Suba o projeto para um repositório no GitHub (o `.env.local` **não** vai junto, e é isso mesmo).
2. Em [vercel.com/new](https://vercel.com/new), clique em **Import** no repositório. O preset **Vite** é detectado sozinho.
3. Antes de clicar em **Deploy**, abra **Environment Variables** e cadastre as três:

   | Key | Value |
   | --- | --- |
   | `SPOTIFY_CLIENT_ID` | o Client ID |
   | `SPOTIFY_CLIENT_SECRET` | o Client secret |
   | `SPOTIFY_REFRESH_TOKEN` | o refresh token do passo 3 |

4. Clique em **Deploy**.

Se o projeto já estiver publicado: **Settings** → **Environment Variables** → adicione as três (marque **Production**, **Preview** e **Development**) → **Save** → **Deployments** → três pontinhos do último deploy → **Redeploy**.

> O refresh token é gerado **no seu computador** (passo 3) e só copiado para a Vercel. Não precisa cadastrar o endereço da Vercel no Redirect URI.

## ⚙️ Como funciona

```text
Navegador ──GET /api/spotify?resource=stats&range=short_term──▶ vite.config.js (dev) ou api/spotify.js (Vercel)
          ──GET /api/spotify?resource=now (a cada 30 s)──────▶        │
                                                                      │ 1. POST accounts.spotify.com/api/token
                                                                      │    (refresh token → access token, 1 h)
                                                                      ▼
                                       GET /v1/me                                  perfil
                                       GET /v1/me/top/tracks?time_range=...        mais ouvidas
                                       GET /v1/me/top/artists?time_range=...       artistas
                                       GET /v1/me/player/recently-played           tocadas recentemente
                                       GET /v1/me/player/currently-playing         tocando agora (204 = nada)
```

- O **Client secret** e o **refresh token** nunca saem do servidor. O navegador só recebe as músicas, já resumidas (nome, artistas, capa, duração, link).
- O **access token** fica guardado na memória do servidor até 1 minuto antes de vencer: não é pedido de novo a cada visita.
- "Tocando agora" fica **15 s** em cache e as estatísticas **5 minutos** (na memória da função e na CDN da Vercel): muita gente abrindo a página não gasta o limite de chamadas do Spotify.
- Nada tocando (`204`)? O servidor busca a última música em `recently-played`.
- A barra de progresso anda sozinha no navegador entre uma busca e outra.
- O **player** é o iframe oficial (`open.spotify.com/embed/track/{id}`): toca 30 s para quem não está logado e a música inteira para quem está.

### Mudanças da Web API em 2026 (já consideradas aqui)

Em **fevereiro de 2026** o Spotify removeu endpoints e campos para apps em Development Mode. Este projeto usa só o que continua disponível:

| Removido | O que este projeto faz |
| --- | --- |
| `GET /artists/{id}/top-tracks`, `GET /browse/new-releases`, `GET /users/{id}`... | Usa só os endpoints `/me/...` da sua conta |
| `popularity` (músicas e artistas), `followers` (artistas e usuário), `product`, `email` | Não depende desses campos |
| `GET /search`: `limit` máximo caiu de 50 para **10** | Não usa a busca |

Detalhes em [February 2026 Web API Changes](https://developer.spotify.com/documentation/web-api/references/changes/february-2026).

## 🃏 Aba "Cards prontos"

Os cards do meu portfólio são **imagens** geradas por serviços da comunidade: basta um `<img>` com o seu id do Spotify. Eles **não** usam a Web API deste projeto.

| Card | Serviço | Cadastro |
| --- | --- | --- |
| Resumo do perfil | [Data Card for Spotify](https://github.com/Twitchkidd/data-card-for-spotify) | entrar com o Spotify no site do serviço |
| Tocando agora | [spotify-github-profile](https://github.com/kittinan/spotify-github-profile) | entrar com o Spotify no site do serviço |
| Tocadas recentemente | [spotify-recently-played-readme](https://github.com/JeffreyCA/spotify-recently-played-readme) | entrar com o Spotify no site do serviço |
| Last.fm | [lastfm-recently-played-readme](https://github.com/JeffreyCA/lastfm-recently-played-readme) | ter conta no Last.fm (scrobbling ligado) |

Troque os ids em `src/config/spotifyConfig.js`:

```js
CARDS: {
  SPOTIFY_USER_ID: "22lih5eniohc7dawfxohlo7wy", // open.spotify.com/user/<ID>
  LASTFM_USER: "joaoaramuni",                   // "" esconde o card do Last.fm
  EMBED_TRACK_ID: "0o8AsVRLRF15nT8GsLz5zO",     // música do player
},
```

> ⚠️ Esses serviços são de terceiros e gratuitos: podem ficar lentos ou fora do ar. Para algo que você controla, use a aba **Web API**.

## 🧩 Usando no seu projeto

Copie para o seu projeto React + Vite:

```text
api/_spotify.js                   → lógica (servidor) + login para gerar o refresh token
api/spotify.js                    → Vercel Function /api/spotify
src/config/spotifyConfig.js       → períodos, intervalo do "tocando agora", cards
src/services/spotifyService.js    → fetch para /api/spotify
src/components/Spotify/           → componentes + CSS
```

Junte o plugin `spotifyApi(env)` ao seu `vite.config.js` (veja o deste projeto, inclusive o `server.host: "127.0.0.1"`) e use:

```jsx
import SpotifyDashboard from "./components/Spotify/SpotifyDashboard";
import NowPlaying from "./components/Spotify/NowPlaying";
import SpotifyCards from "./components/Spotify/SpotifyCards";

<SpotifyDashboard />                         {/* tudo */}
<SpotifyDashboard initialRange="long_term" /> {/* abre em "1 ano" */}
<NowPlaying />                               {/* só o "tocando agora" (ex.: no topo do portfólio) */}
<SpotifyCards />                             {/* só os cards prontos */}
```

| Opção (`spotifyConfig.js`) | Padrão | O que faz |
| --- | --- | --- |
| `DEFAULT_RANGE` | `"short_term"` | Período inicial (`short_term` ≈ 4 semanas, `medium_term` ≈ 6 meses, `long_term` ≈ 1 ano) |
| `NOW_REFRESH_SECONDS` | `30` | De quanto em quanto tempo o "tocando agora" pergunta de novo |
| `DEFAULT_TAB` | `"api"` | Aba inicial: `"api"` ou `"cards"` |
| `CARDS` | ids do meu perfil | Ids usados na aba "Cards prontos" |

## 📂 Estrutura do Projeto

```text
📁 SpotifyAPI
│
├── 📁 api
│   ├── _spotify.js      └── Token, chamadas à Web API, normalização e login (gera o refresh token)
│   └── spotify.js       └── Vercel Function: GET /api/spotify
│
├── 📁 imgs              └── Capturas de tela usadas neste README
├── 📁 public            └── pucminas-logo.png (favicon)
│
├── 📁 src
│   ├── 📁 assets/images └── pucminas-logo.png
│   │
│   ├── 🧩 components
│   │   ├── PageLayout/               └── Card da página com a faixa azul (logo PUC + logo do Spotify)
│   │   └── Spotify/
│   │       ├── SpotifyDashboard.jsx  └── Abas, perfil, mais ouvidas, artistas, recentes e player
│   │       ├── NowPlaying.jsx        └── "Tocando agora" (atualiza sozinho)
│   │       ├── SpotifyCards.jsx      └── Cards prontos do portfólio (terceiros)
│   │       ├── format.js             └── "3:35", "há 5 min" (pt-BR)
│   │       └── Spotify.css
│   │
│   ├── ⚙️ config/spotifyConfig.js
│   ├── 🛠️ services/spotifyService.js
│   ├── App.jsx
│   ├── index.css               └── Reset, variáveis de cor e fundo da página
│   └── main.jsx
│
├── 📄 .env.example
├── 📄 vite.config.js    └── Atende /api/spotify (e o login, só no dev) e escuta em 127.0.0.1
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

- [`react-icons`](https://react-icons.github.io/react-icons/): ícones (inclusive o logo do Spotify na faixa azul)
- Nenhuma biblioteca para chamar a API nem para o OAuth: só `fetch`.

## 🧪 Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento em `http://127.0.0.1:5173` (com `/api/spotify` e o login) |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Testa o build localmente (atende `/api/spotify`, sem o login) |
| `npm run lint` | Lint com o oxlint (padrão do template atual do Vite) |

## 📄 Licença
Este projeto está licenciado sob a MIT License.
