# Projeto WakaTimeAPI (React + Vite) ⏱️

## 📖 Descrição

Painel com as estatísticas do **WakaTime**, feito com **React** e **Vite**: quanto tempo você passou programando, em quais **linguagens**, **editores**, **sistemas operacionais**, **categorias** e **projetos**. Tem botões de período (7 dias, 30 dias, 6 meses, 1 ano e desde sempre), o tempo programado **hoje** e o cartão **🟢 Codando agora**, que mostra em qual projeto você está mexendo no editor **neste momento**.

A ideia é que você copie o componente `<WakaTimeStats />` para o **seu portfólio** ou para qualquer outro projeto React.

O que o projeto mostra:

- **🟢 Codando agora**: projeto, branch, linguagem, editor e duração da sessão que está acontecendo agora (atualiza sozinho a cada minuto)
- **Indicadores**: tempo total, média diária, dias ativos, tempo de hoje e melhor dia
- **Barra de linguagens** (parte do todo) e **ranking** com tempo e porcentagem
- **Editores**, **sistemas operacionais** e **categorias** (programando, documentação, testes...)
- **Projetos** em que você mais trabalhou (pode ser escondido)
- Estados de **carregando**, **erro** e "WakaTime ainda calculando"

## 🖼️ Capturas de Tela

| Desktop | Celular |
| :---: | :---: |
| ![Home](https://joaopauloaramuni.github.io/react-imgs/WakaTimeAPI/imgs/Home_v2.png) | ![Mobile](https://joaopauloaramuni.github.io/react-imgs/WakaTimeAPI/imgs/Mobile_v2.png) |

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

Se preferir não usar a chave, deixe o seu perfil público em [wakatime.com/settings/profile](https://wakatime.com/settings/profile) (tempo de código, linguagens, editores e sistemas operacionais públicos) e preencha só o `WAKATIME_USERNAME`. Nesse modo o indicador **Hoje** e o cartão **Codando agora** não aparecem (os dois usam dados privados).

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

   # Opcional: projetos que aparecem pelo nome no "Codando agora"
   # (soma com o CODING_NOW.PUBLIC_PROJECTS do wakatimeConfig.js)
   WAKATIME_PUBLIC_PROJECTS=meu-portfolio,WakaTimeAPI
   ```

3. **Reinicie** o `npm run dev` (o Vite só lê o `.env.local` quando inicia).

> 💡 **Por que a variável não começa com `VITE_`?** Tudo que começa com `VITE_` é colocado **dentro do JavaScript** que vai para o navegador, e qualquer visitante consegue ler. Por isso a chave fica sem o prefixo e é lida **só no servidor**: pelo `vite.config.js` no `npm run dev` e pelas **Vercel Functions** `api/wakatime.js` e `api/codando.js` em produção.

## ☁️ Deploy na Vercel (variável de ambiente)

1. Suba o projeto para um repositório no GitHub (o `.env.local` **não** vai junto, e é isso mesmo).
2. Em [vercel.com/new](https://vercel.com/new), clique em **Import** no repositório. O preset **Vite** é detectado sozinho.
3. Antes de clicar em **Deploy**, abra a seção **Environment Variables** e cadastre:

   | Key | Value |
   | --- | --- |
   | `WAKATIME_API_KEY` | `waka_...` (a sua chave) |
   | `WAKATIME_PUBLIC_PROJECTS` | opcional, ex.: `meu-portfolio,WakaTimeAPI` |

4. Clique em **Deploy**.

Se o projeto já estiver publicado:

1. Abra o projeto na Vercel → **Settings** → **Environment Variables**.
2. Em **Key** coloque `WAKATIME_API_KEY`, em **Value** a sua chave, deixe marcados **Production**, **Preview** e **Development** e clique em **Save**.
3. Vá em **Deployments**, clique nos **três pontinhos** do último deploy → **Redeploy**. As variáveis só valem para deploys feitos **depois** de cadastradas.

> A pasta `api/` vira **Serverless Functions** automaticamente na Vercel: `api/wakatime.js` responde em `https://seu-projeto.vercel.app/api/wakatime` e `api/codando.js` em `https://seu-projeto.vercel.app/api/codando`. Arquivos que começam com `_` (como `api/_wakatime.js`) **não** viram rota.

## ⚙️ Como funciona

```text
Navegador ──GET /api/wakatime?range=last_7_days──▶  vite.config.js (npm run dev)
                                                     ou api/wakatime.js (Vercel)
                                                            │  + WAKATIME_API_KEY
                                                            ▼
                                       https://wakatime.com/api/v1/users/current/stats/last_7_days

Navegador ──GET /api/codando (a cada 1 min)──────▶  vite.config.js (npm run dev)
                                                     ou api/codando.js (Vercel)
                                                            │  + WAKATIME_API_KEY
                                                            ▼
                                       https://wakatime.com/api/v1/users/current/heartbeats?date=hoje
```

- O WakaTime **não libera CORS** e a chave **não pode ir para o navegador**: por isso existe a rota `/api/wakatime` no próprio site.
- A chave vai no cabeçalho `Authorization: Basic base64(chave)`, como pede a [documentação do WakaTime](https://wakatime.com/developers).
- O servidor devolve só os campos que a tela usa (resposta bem menor) e a Vercel guarda a resposta por **10 minutos** no cache da CDN.
- Endpoints usados: `GET /users/current/stats/:range`, `GET /users/current/status_bar/today` (tempo de hoje), `GET /users/current/heartbeats?date=` e `GET /users/current/user_agents` (codando agora).

## 🟢 Codando agora (projeto em construção no momento)

Acima dos botões de período aparece um cartão dizendo **em qual projeto você está programando agora**, com a branch, a linguagem, o editor, há quanto tempo a sessão começou e quanto tempo você já passou nesse projeto hoje. Parado, ele vira uma linha discreta: *"Parado agora · Última atividade há 3 h em WakaTimeAPI"*.

```text
● CODANDO AGORA                                         último sinal há 1 min
📁 desenvolvimento-e-integracao-de-aplicacoes-web   ⎇ main
● JavaScript   🖥 VS Code   🕒 sessão de 45 min (desde 14:32)   ☀ 2 h 10 min hoje neste projeto
```

### De onde vem essa informação

A extensão do WakaTime no editor manda um **heartbeat** (um "sinal de vida") a cada ~2 minutos enquanto você digita. Cada heartbeat diz o **projeto** (em geral, o nome da pasta aberta), a **branch** do Git, a **linguagem**, o **editor** e o arquivo.

A rota `/api/codando` (arquivo `api/_codando.js`) faz o seguinte:

1. Busca os heartbeats de hoje em `GET /users/current/heartbeats?date=AAAA-MM-DD` (no fuso da sua conta).
2. Descarta os heartbeats que não são de arquivo (os de navegador trazem domínios visitados).
3. Olha o **último**: se chegou há até `ACTIVE_MINUTES` (10 min), você está **codando agora**.
4. Volta pelos heartbeats até achar uma pausa maior que `BREAK_MINUTES` (15 min, o mesmo timeout do WakaTime): ali começou a **sessão**.
5. Soma os intervalos entre heartbeats seguidos para calcular o tempo de hoje no projeto (é aproximado: o dashboard do WakaTime pode diferir em alguns minutos).
6. Troca o id do editor pelo nome (`GET /users/current/user_agents`, guardado por 1 hora).

O componente pergunta de novo **a cada minuto** enquanto a aba está aberta (e na hora em que você volta para ela).

> 🔒 Heartbeats são **privados**: o cartão só funciona com a `WAKATIME_API_KEY`. No modo perfil público (só `WAKATIME_USERNAME`) a rota responde `503` e o cartão simplesmente não aparece.

### Privacidade

- O **caminho do arquivo** que você está editando **nunca sai do servidor**: a resposta só leva projeto, branch, linguagem e editor.
- Por padrão todos os projetos aparecem pelo nome (`PUBLIC_PROJECTS: ["*"]`). Para esconder **projetos de cliente**, troque por uma lista com os projetos que podem aparecer. Os outros viram **"projeto privado"** (sem nome e sem branch), ou somem de vez com `SHOW_PRIVATE: false`.
- Também dá para somar nomes pela variável `WAKATIME_PUBLIC_PROJECTS` (separados por vírgula), sem mexer no código.
- `<WakaTimeStats showProjects={false} />` também esconde o nome do projeto no cartão.

### Configuração (`src/config/wakatimeConfig.js`)

```js
CODING_NOW: {
  API_PATH: "/api/codando",
  TIMEZONE: "America/Sao_Paulo", // fuso da sua conta: é por ele que o WakaTime separa os dias
  ACTIVE_MINUTES: 10,            // último heartbeat há até 10 min = "codando agora"
  BREAK_MINUTES: 15,             // pausa maior que isso encerra a sessão
  REFRESH_SECONDS: 60,           // de quanto em quanto tempo a página pergunta de novo
  PUBLIC_PROJECTS: ["*"],        // ou ["meu-portfolio", "WakaTimeAPI"]
  SHOW_PRIVATE: true,            // false: projeto fora da lista não aparece
},
```

> 💡 **Custo:** a resposta é igual para todos os visitantes, então fica **60 s** no cache da CDN da Vercel e 60 s na memória da função. A chave é usada no máximo uma vez por minuto, não importa quantas pessoas estejam com a página aberta.

### Testando

Rode `npm run dev`, abra qualquer projeto no VS Code (com a extensão do WakaTime) e digite por 1 ou 2 minutos. Em até um minuto o cartão fica verde com o nome do projeto. Para ver a resposta crua, acesse `http://localhost:5173/api/codando`:

```json
{
  "active": true,
  "todaySeconds": 15600,
  "last": {
    "isPublic": true,
    "project": "WakaTimeAPI",
    "branch": "main",
    "language": "JavaScript",
    "editor": "VS Code",
    "at": 1791714685882,
    "sessionStart": 1791711985882,
    "projectTodaySeconds": 7800
  }
}
```

## 🧩 Usando no seu projeto

Copie para o seu projeto React + Vite:

```text
api/_wakatime.js                         → lógica das estatísticas (servidor)
api/wakatime.js                          → Vercel Function /api/wakatime
api/_codando.js                          → lógica do "codando agora" (servidor)
api/codando.js                           → Vercel Function /api/codando
src/config/wakatimeConfig.js             → períodos, link do perfil, limites, CODING_NOW
src/services/wakatimeService.js          → fetch para /api/wakatime e /api/codando
src/components/WakaTimeStats/            → componentes + CSS
```

Junte o plugin `wakatimeApi(env)` ao seu `vite.config.js` (veja o deste projeto) e use:

```jsx
import WakaTimeStats from "./components/WakaTimeStats/WakaTimeStats";

<WakaTimeStats />
<WakaTimeStats initialRange="all_time" />
<WakaTimeStats showRangePicker={false} showProjects={false} />
<WakaTimeStats showCodingNow={false} />
```

Quer só o cartão "Codando agora" (ex.: no topo do portfólio)? Ele também funciona sozinho:

```jsx
import CodingNow from "./components/WakaTimeStats/CodingNow";

<CodingNow />
```

| Prop | Padrão | O que faz |
| --- | --- | --- |
| `initialRange` | `"last_7_days"` | Período inicial (`last_7_days`, `last_30_days`, `last_6_months`, `last_year`, `all_time`) |
| `showRangePicker` | `true` | Mostra os botões de período |
| `showProjects` | `true` | Mostra os nomes dos projetos (use `false` para esconder projetos de cliente). Vale também para o cartão "Codando agora" |
| `showCodingNow` | `true` | Mostra o cartão "Codando agora" (projeto em que você está mexendo neste momento) |

O CSS usa as variáveis do `index.css` (`--brand`, `--muted`...) com valores padrão: o componente fica igual mesmo se o seu projeto não tiver essas variáveis.

## 📂 Estrutura do Projeto

```text
📁 WakaTimeAPI
│
├── 📁 api
│   ├── _wakatime.js     └── Chama o WakaTime com a chave e normaliza a resposta
│   ├── wakatime.js      └── Vercel Function: GET /api/wakatime
│   ├── _codando.js      └── Lê os heartbeats de hoje e monta o "codando agora"
│   └── codando.js       └── Vercel Function: GET /api/codando
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
│   │       ├── CodingNow.jsx             └── Cartão "Codando agora" (atualiza a cada minuto)
│   │       ├── format.js                 └── Formata horas, porcentagens, datas e "há 3 min" (pt-BR)
│   │       └── languageColors.js         └── Cor de cada linguagem (GitHub Linguist)
│   │
│   ├── ⚙️ config
│   │   └── wakatimeConfig.js   └── Períodos, link do perfil, linguagens escondidas, CODING_NOW
│   │
│   ├── 🛠️ services
│   │   └── wakatimeService.js  └── fetch para /api/wakatime (cache por período) e /api/codando
│   │
│   ├── App.jsx
│   ├── index.css               └── Reset, variáveis de cor e fundo da página
│   └── main.jsx
│
├── 📄 .env.example
├── 📄 vite.config.js           └── Atende /api/wakatime e /api/codando no npm run dev
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
| `npm run dev` | Servidor de desenvolvimento (com as rotas `/api/wakatime` e `/api/codando`) |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Testa o build localmente (também atende `/api/wakatime` e `/api/codando`) |
| `npm run lint` | Lint com o oxlint (padrão do template atual do Vite) |

## 📄 Licença
Este projeto está licenciado sob a MIT License.
