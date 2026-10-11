# Projeto MapBoxAPI (React + Vite) 🗺️

## 📖 Descrição

Mapa interativo feito com **React**, **Vite** e o [**Mapbox GL JS**](https://docs.mapbox.com/mapbox-gl-js/guides/). Mostra as **unidades da PUC Minas** com marcadores numerados e popups, uma lista lateral para "voar" até cada lugar, **busca de endereços** (Mapbox Geocoding API) e troca de **estilo do mapa** (ruas, relevo, claro, escuro e satélite).

A ideia é você trocar os lugares pelos seus (onde estudou, trabalhou, viajou, fez projetos...) e colocar o mapa no **seu portfólio**.

Recursos:

- Marcadores com número + **popup** com nome e endereço
- **Lista de lugares**: clique para o mapa voar até o lugar (`flyTo`)
- **Ver todas**: enquadra todos os lugares (`fitBounds`)
- **Busca de endereços** enquanto digita (com *debounce*), limitada ao Brasil
- **5 estilos de mapa**, nomes em **português**
- Controles de **zoom/bússola**, **tela cheia**, **minha localização** e **escala**
- Sem o token, aparece um **passo a passo** no lugar do mapa
- O mapbox-gl (~1,7 MB) só é baixado quando o mapa aparece (`React.lazy`)

## 🎓 Acesso de estudante: crie a conta com o e-mail da PUC Minas

> **Importante:** crie a sua conta no Mapbox usando o seu e-mail institucional **@pucminas.edu.br**. É com ele que você tem o **acesso de estudante** ao Mapbox.

## 🖼️ Capturas de Tela

| Mapa | Sem token configurado |
| :---: | :---: |
| ![Home](https://joaopauloaramuni.github.io/react-imgs/MapBoxAPI/imgs/Home.png) | ![Sem token](https://joaopauloaramuni.github.io/react-imgs/MapBoxAPI/imgs/SemToken.png) |

## 🚀 Como rodar

```bash
npm install
cp .env.example .env.local   # depois coloque o seu VITE_MAPBOX_TOKEN
npm run dev
```

Acesse `http://localhost:5173`.

## 🔑 Como criar o token do Mapbox

1. Acesse [account.mapbox.com/auth/signup](https://account.mapbox.com/auth/signup/) e crie a conta com o seu e-mail **@pucminas.edu.br**.
2. Confirme o e-mail (o Mapbox manda um link de verificação) e entre na conta.
3. Abra a página de tokens: [account.mapbox.com/access-tokens](https://account.mapbox.com/access-tokens/).
4. Copie o **Default public token** (começa com `pk.`). Ele já tem as permissões públicas que o mapa e a busca precisam.
5. **Recomendado:** crie um token só para o portfólio, com restrição de URL:
   1. Clique em **Create a token** e dê um nome, ex.: `portfolio`.
   2. Mantenha os **Public scopes** que já vêm marcados.
   3. Em **URL restrictions**, adicione `http://localhost:5173` e o endereço do seu site na Vercel, ex.: `https://seu-projeto.vercel.app`.
   4. Clique em **Create token** e copie o token `pk.`.

> 💡 **Token público x secreto:** o token `pk.` foi feito para ficar no navegador (o mapa precisa dele para baixar os blocos do mapa). A proteção dele é a **restrição de URL**: mesmo que alguém copie, ele não funciona em outro site. Já um token **secreto** (`sk.`) **nunca** pode ir para o front-end.

> O plano gratuito do Mapbox tem uma cota mensal de carregamentos de mapa e de buscas; confira os valores em [mapbox.com/pricing](https://www.mapbox.com/pricing) e acompanhe o uso em [account.mapbox.com](https://account.mapbox.com/).

## 🔐 Configurando o `.env.local`

O `.env.local` guarda as variáveis de ambiente **só na sua máquina**: ele está no `.gitignore` e **não vai para o GitHub**.

1. Copie o modelo:

   ```bash
   cp .env.example .env.local
   ```

2. Preencha:

   ```properties
   VITE_MAPBOX_TOKEN=pk.eyJ1Ijoi...
   ```

3. **Reinicie** o `npm run dev`.

> 💡 **Por que aqui tem `VITE_`?** Nos outros projetos (WakaTime, GitHub, Gemini) as chaves são **secretas** e ficam sem `VITE_`, só no servidor. Aqui o token é **público** e o próprio mapa, no navegador, precisa dele: o `VITE_` faz o Vite colocar o valor no build (`import.meta.env.VITE_MAPBOX_TOKEN`). Por isso a restrição de URL é tão importante.

## ☁️ Deploy na Vercel (variável de ambiente)

1. Suba o projeto para um repositório no GitHub.
2. Em [vercel.com/new](https://vercel.com/new), clique em **Import** no repositório (preset **Vite**).
3. Abra **Environment Variables** e cadastre:

   | Key | Value |
   | --- | --- |
   | `VITE_MAPBOX_TOKEN` | `pk.eyJ1Ijoi...` |

4. Clique em **Deploy**.
5. Copie o endereço do site (ex.: `https://seu-projeto.vercel.app`) e adicione nas **URL restrictions** do token no Mapbox.

Se o projeto já estiver publicado: **Settings** → **Environment Variables** → adicione `VITE_MAPBOX_TOKEN` (marque **Production**, **Preview** e **Development**) → **Save** → **Deployments** → três pontinhos do último deploy → **Redeploy**.

> ⚠️ Variáveis `VITE_` entram no **build**: depois de mudar o token na Vercel é **obrigatório** fazer o **Redeploy**.

## ✏️ Colocando os SEUS lugares

Edite `src/data/places.js`:

```js
{
  id: "coreu",
  name: "PUC Minas Coração Eucarístico",
  city: "Belo Horizonte",
  address: "Av. Dom José Gaspar, 500 - Coração Eucarístico",
  coordinates: [-43.9917, -19.9221], // [longitude, latitude]
},
```

> ⚠️ O Mapbox usa **[longitude, latitude]**, nessa ordem (o contrário do Google Maps). No Google Maps, clique com o botão direito num ponto para copiar `latitude, longitude` e **inverta** a ordem aqui.

O centro e o zoom iniciais, o idioma e os estilos ficam em `src/config/mapboxConfig.js`.

## ⚙️ Como funciona

- O **mapbox-gl não é um componente React**: ele desenha num `<div>`. Por isso o mapa é criado **uma vez** num `useEffect`, guardado num `useRef`, e as mudanças de props viram chamadas aos métodos dele:

  | Mudança no React | Chamada no Mapbox |
  | --- | --- |
  | Trocou o estilo | `map.setStyle(url)` |
  | Escolheu um lugar | `map.flyTo({ center, zoom })` + abre o popup |
  | "Ver todas" | `map.fitBounds(bounds)` |
  | Escolheu um resultado da busca | novo `Marker` vermelho + `flyTo` |

- Os marcadores são elementos HTML (`new mapboxgl.Marker({ element })`), então continuam no lugar quando o estilo muda.
- Os popups são montados com `textContent` (nada vira HTML): sem risco de XSS.
- A busca chama a [Geocoding API v6](https://docs.mapbox.com/api/search/geocoding/) com o mesmo token, `language=pt`, `country=br` e `proximity` no centro do mapa, esperando **350 ms** sem digitar antes de buscar.
- Ao desmontar o componente, `map.remove()` libera o WebGL.

## 🧩 Usando no seu projeto

```bash
npm install mapbox-gl
```

Copie `src/components/MapboxMap/`, `src/components/MapExplorer/`, `src/config/mapboxConfig.js`, `src/services/geocodingService.js` e `src/data/places.js`:

```jsx
import MapExplorer from "./components/MapExplorer/MapExplorer";
import MapboxMap from "./components/MapboxMap/MapboxMap";
import PLACES from "./data/places";

<MapExplorer places={PLACES} />   {/* lista + busca + estilos + mapa */}

<div style={{ height: 400 }}>
  <MapboxMap places={PLACES} />    {/* só o mapa com os marcadores */}
</div>
```

| Prop do `<MapboxMap />` | O que faz |
| --- | --- |
| `places` | Lugares com marcador (formato de `data/places.js`) |
| `selectedId` / `onSelect` | Lugar escolhido e o que fazer ao clicar num marcador |
| `styleUrl` | Estilo do mapa (`mapbox://styles/mapbox/streets-v12`...) |
| `searchResult` | `{ name, address, coordinates }` para o marcador vermelho |
| `fitKey` | Mude o número para enquadrar todos os lugares |

## 📂 Estrutura do Projeto

```text
📁 MapBoxAPI
│
├── 📁 imgs              └── Capturas de tela usadas neste README
├── 📁 public            └── pucminas-logo.png (favicon)
│
├── 📁 src
│   ├── 📁 assets/images └── pucminas-logo.png
│   │
│   ├── 🧩 components
│   │   ├── PageLayout/          └── Card da página com a faixa azul (logo PUC + logo da API)
│   │   ├── MapboxMap/
│   │   │   ├── MapboxMap.jsx    └── Mapa, controles, marcadores, popups, flyTo, fitBounds
│   │   │   └── MapboxMap.css
│   │   └── MapExplorer/
│   │       ├── MapExplorer.jsx  └── Lista de lugares + busca + estilos + mapa
│   │       ├── TokenMissing.jsx └── Passo a passo quando falta o token
│   │       └── MapExplorer.css
│   │
│   ├── ⚙️ config/mapboxConfig.js       └── Token, centro, zoom, idioma e estilos
│   ├── 📊 data/places.js               └── SEUS lugares
│   ├── 🛠️ services/geocodingService.js └── Busca de endereços (Geocoding API v6)
│   ├── App.jsx                         └── Carrega o mapa com React.lazy
│   ├── index.css
│   └── main.jsx
│
├── 📄 .env.example
├── 📄 vite.config.js
└── 📄 package.json
```

## 📦 Dependências

```json
"dependencies": {
  "mapbox-gl": "^3.32.0",
  "react": "^19.2.8",
  "react-dom": "^19.2.8",
  "react-icons": "^5.7.0"
}
```

- [`mapbox-gl`](https://www.npmjs.com/package/mapbox-gl): SDK oficial do Mapbox para mapas na web
- [`react-icons`](https://react-icons.github.io/react-icons/): ícones (inclusive o logo do Mapbox na faixa azul)

## 🧪 Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Testa o build localmente |
| `npm run lint` | Lint com o oxlint (padrão do template atual do Vite) |

## 📄 Licença
Este projeto está licenciado sob a MIT License.
