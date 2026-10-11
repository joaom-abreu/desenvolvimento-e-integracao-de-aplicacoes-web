# Projeto WakaTimeAPI (React + Vite) ⏱️

## 📖 Descrição

Painel com as estatísticas do **WakaTime**, feito com **React** e **Vite**: quanto tempo você passou programando, em quais **linguagens**, **editores**, **sistemas operacionais**, **categorias** e **projetos**. Tem botões de período (7 dias, 30 dias, 6 meses, 1 ano e desde sempre) e o tempo programado **hoje**.

A ideia é que você copie o componente `<WakaTimeStats />` para o **seu portfólio** ou para qualquer outro projeto React.

O que o projeto mostra:

- **Indicadores**: tempo total, média diária, dias ativos, tempo de hoje e melhor dia
- **Barra de linguagens** (parte do todo) e **ranking** com tempo e porcentagem
- **Editores**, **sistemas operacionais** e **categorias** (programando, documentação, testes...)
- **Projetos** em que você mais trabalhou (pode ser escondido)
- Estados de **carregando**, **erro** e "WakaTime ainda calculando"

## 🖼️ Capturas de Tela

| Desktop | Celular |
| :---: | :---: |
| ![Home](https://joaopauloaramuni.github.io/react-imgs/WakaTimeAPI/imgs/Home.png) | ![Mobile](https://joaopauloaramuni.github.io/react-imgs/WakaTimeAPI/imgs/Mobile.png) |

## 🚀 Como rodar

```bash
npm install
cp .env.example .env.local   # depois coloque a sua WAKATIME_API_KEY
npm run dev
```

Acesse `http://localhost:5173`.

> Sem o `.env.local` o projeto abre normalmente, mas o painel mostra o aviso **"Configure WAKATIME_API_KEY..."**.

## 🔑 Como criar a sua API key no WakaTime

1. Crie uma conta gratuita em [wakatime.com/signup](https://wakatime.com/signup) (dá para entrar com o GitHub).
2. Instale o plugin do WakaTime no seu editor. No **VS Code**: aba **Extensions** → procure **WakaTime** → **Install**.
3. O VS Code vai pedir a **API key** na primeira vez. Ela está em [wakatime.com/settings/api-key](https://wakatime.com/settings/api-key).
4. Programe um pouco: o plugin manda os dados para o WakaTime enquanto você digita. As primeiras estatísticas aparecem no [dashboard](https://wakatime.com/dashboard) depois de alguns minutos.
5. Copie a API key (começa com `waka_`) para usar no `.env.local` e na Vercel.

> ⚠️ A API key é **secreta**: com ela dá para ler todos os seus dados no WakaTime. Nunca coloque no código, em prints ou no GitHub.

### Alternativa sem chave: perfil público

Se preferir não usar a chave, deixe o seu perfil público em [wakatime.com/settings/profile](https://wakatime.com/settings/profile) (tempo de código, linguagens, editores e sistemas operacionais públicos) e preencha só o `WAKATIME_USERNAME`. Nesse modo o indicador **Hoje** não aparece (ele é privado).

## 🔐 Configurando o `.env.local`

O `.env.local` guarda as variáveis de ambiente **só na sua máquina**: ele está no `.gitignore` e **não vai para o GitHub**.

1. Copie o modelo:

   ```bash
   cp .env.example .env.local
   ```

2. Preencha:

   ```properties
   WAKATIME_API_KEY=waka_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

   # Opcional (só é usado quando NÃO há chave): perfil público
   WAKATIME_USERNAME=seu_usuario
   ```

3. **Reinicie** o `npm run dev` (o Vite só lê o `.env.local` quando inicia).

> 💡 **Por que a variável não começa com `VITE_`?** Tudo que começa com `VITE_` é colocado **dentro do JavaScript** que vai para o navegador, e qualquer visitante consegue ler. Por isso a chave fica sem o prefixo e é lida **só no servidor**: pelo `vite.config.js` no `npm run dev` e pela **Vercel Function** `api/wakatime.js` em produção.

## ☁️ Deploy na Vercel (variável de ambiente)

1. Suba o projeto para um repositório no GitHub (o `.env.local` **não** vai junto, e é isso mesmo).
2. Em [vercel.com/new](https://vercel.com/new), clique em **Import** no repositório. O preset **Vite** é detectado sozinho.
3. Antes de clicar em **Deploy**, abra a seção **Environment Variables** e cadastre:

   | Key | Value |
   | --- | --- |
   | `WAKATIME_API_KEY` | `waka_...` (a sua chave) |

4. Clique em **Deploy**.

Se o projeto já estiver publicado:

1. Abra o projeto na Vercel → **Settings** → **Environment Variables**.
2. Em **Key** coloque `WAKATIME_API_KEY`, em **Value** a sua chave, deixe marcados **Production**, **Preview** e **Development** e clique em **Save**.
3. Vá em **Deployments**, clique nos **três pontinhos** do último deploy → **Redeploy**. As variáveis só valem para deploys feitos **depois** de cadastradas.

> A pasta `api/` vira **Serverless Functions** automaticamente na Vercel: `api/wakatime.js` responde em `https://seu-projeto.vercel.app/api/wakatime`. Arquivos que começam com `_` (como `api/_wakatime.js`) **não** viram rota.

## ⚙️ Como funciona

```text
Navegador ──GET /api/wakatime?range=last_7_days──▶  vite.config.js (npm run dev)
                                                     ou api/wakatime.js (Vercel)
                                                            │  + WAKATIME_API_KEY
                                                            ▼
                                       https://wakatime.com/api/v1/users/current/stats/last_7_days
```

- O WakaTime **não libera CORS** e a chave **não pode ir para o navegador**: por isso existe a rota `/api/wakatime` no próprio site.
- A chave vai no cabeçalho `Authorization: Basic base64(chave)`, como pede a [documentação do WakaTime](https://wakatime.com/developers).
- O servidor devolve só os campos que a tela usa (resposta bem menor) e a Vercel guarda a resposta por **10 minutos** no cache da CDN.
- Endpoints usados: `GET /users/current/stats/:range` e `GET /users/current/status_bar/today` (tempo de hoje).

## 🧩 Usando no seu projeto

Copie para o seu projeto React + Vite:

```text
api/_wakatime.js                         → lógica (servidor)
api/wakatime.js                          → Vercel Function
src/config/wakatimeConfig.js             → períodos, link do perfil, limites
src/services/wakatimeService.js          → fetch para /api/wakatime
src/components/WakaTimeStats/            → componente + CSS
```

Junte o plugin `wakatimeApi(env)` ao seu `vite.config.js` (veja o deste projeto) e use:

```jsx
import WakaTimeStats from "./components/WakaTimeStats/WakaTimeStats";

<WakaTimeStats />
<WakaTimeStats initialRange="all_time" />
<WakaTimeStats showRangePicker={false} showProjects={false} />
```

| Prop | Padrão | O que faz |
| --- | --- | --- |
| `initialRange` | `"last_7_days"` | Período inicial (`last_7_days`, `last_30_days`, `last_6_months`, `last_year`, `all_time`) |
| `showRangePicker` | `true` | Mostra os botões de período |
| `showProjects` | `true` | Mostra os nomes dos projetos (use `false` para esconder projetos de cliente) |

O CSS usa as variáveis do `index.css` (`--brand`, `--muted`...) com valores padrão: o componente fica igual mesmo se o seu projeto não tiver essas variáveis.

## 📂 Estrutura do Projeto

```text
📁 WakaTimeAPI
│
├── 📁 api
│   ├── _wakatime.js     └── Chama o WakaTime com a chave e normaliza a resposta
│   └── wakatime.js      └── Vercel Function: GET /api/wakatime
│
├── 📁 imgs              └── Capturas de tela usadas neste README
├── 📁 public            └── pucminas-logo.png (favicon)
│
├── 📁 src
│   ├── 📁 assets/images └── pucminas-logo.png
│   │
│   ├── 🧩 components
│   │   ├── PageLayout/          └── Card da página com a faixa azul (logo PUC + logo da API)
│   │   └── WakaTimeStats/
│   │       ├── WakaTimeStats.jsx / .css  └── Painel de estatísticas
│   │       ├── format.js                 └── Formata horas, porcentagens e datas (pt-BR)
│   │       └── languageColors.js         └── Cor de cada linguagem (GitHub Linguist)
│   │
│   ├── ⚙️ config
│   │   └── wakatimeConfig.js   └── Períodos, link do perfil, linguagens escondidas
│   │
│   ├── 🛠️ services
│   │   └── wakatimeService.js  └── fetch para /api/wakatime, com cache por período
│   │
│   ├── App.jsx
│   ├── index.css               └── Reset, variáveis de cor e fundo da página
│   └── main.jsx
│
├── 📄 .env.example
├── 📄 vite.config.js           └── Atende /api/wakatime no npm run dev
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

- [`react-icons`](https://react-icons.github.io/react-icons/): ícones (inclusive o logo do WakaTime na faixa azul)
- Nenhuma biblioteca para chamar a API: só `fetch`.

## 🧪 Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento (com a rota `/api/wakatime`) |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Testa o build localmente (também atende `/api/wakatime`) |
| `npm run lint` | Lint com o oxlint (padrão do template atual do Vite) |

## 📄 Licença
Este projeto está licenciado sob a MIT License.
