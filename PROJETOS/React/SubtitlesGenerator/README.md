# Projeto SubtitlesGenerator (React + Vite) 🎬

## 📖 Descrição

Gerador de legendas feito com **React**, **Vite**, **ffmpeg.wasm** e a API do **Google Gemini**. Você escolhe um vídeo (**MP4**, **AVI**, **MKV**, **MOV**, **WMV**, **WEBM**...) e recebe a legenda em **português do Brasil** no formato **`.srt`**, pronta para o VLC, o YouTube, players de TV e editores de vídeo.

Se o vídeo estiver em outro idioma (inglês, espanhol, francês...), o Gemini **traduz** a fala para um português do Brasil natural. Se já estiver em português, ele só **transcreve**.

- 🔒 O **vídeo nunca sai do seu computador**: o **ffmpeg.wasm** extrai só o áudio, no próprio navegador;
- ✂️ O áudio é dividido em **trechos de poucos minutos** (tempos mais precisos e pedidos pequenos);
- 🧠 Cada trecho vai para o Gemini com as **regras de legendagem** e o **contexto** do trecho anterior (tradução coerente do começo ao fim);
- 📏 As legendas seguem o **padrão de streaming em pt-BR**: até **2 linhas de 42 caracteres**, de **1 a 7 segundos** na tela, sem sobreposição;
- ✍️ **Revisão antes de baixar**: player com a legenda por cima, edição do texto na tabela e alerta de **velocidade de leitura**.

| Componente | O que mostra |
| --- | --- |
| `<UploadForm />` | Arrastar e soltar o vídeo, idioma falado, tamanho dos trechos, caracteres por linha e sons entre colchetes |
| `<SubtitleStatCards />` | Duração, número de legendas, trechos processados e idioma detectado |
| `<SubtitlePreview />` | Player com a legenda por cima + tabela de revisão (editar texto, clicar no tempo para assistir, caracteres por segundo) |
| `<SrtPreview />` | Conteúdo exato do `.srt`, com **Copiar** e **Baixar .srt** |
| `<ExecutionLog />` | Log de execução com cada etapa (ffmpeg, trechos, Gemini) |
| `<SubtitlesGenerator />` | Todos os anteriores + barra de status/progresso + abas |

## 🖼️ Capturas de Tela

| Início | Legendas |
| :---: | :---: |
| ![Home](https://joaopauloaramuni.github.io/react-imgs/SubtitlesGenerator/imgs/Home.png) | ![Legendas](https://joaopauloaramuni.github.io/react-imgs/SubtitlesGenerator/imgs/Legendas.png) |

| Arquivo SRT | Log de execução |
| :---: | :---: |
| ![SRT](https://joaopauloaramuni.github.io/react-imgs/SubtitlesGenerator/imgs/SRT.png) | ![Log](https://joaopauloaramuni.github.io/react-imgs/SubtitlesGenerator/imgs/Log.png) |

| Celular |
| :---: |
| ![Mobile](https://joaopauloaramuni.github.io/react-imgs/SubtitlesGenerator/imgs/Mobile.png) |

> As capturas usam um vídeo de exemplo (`aula-01-introducao-ao-react.mp4`, 6 min 40 s) e respostas de exemplo do Gemini.

## 🚀 Como rodar

```bash
npm install
cp .env.example .env.local   # depois coloque a sua GEMINI_API_KEY
npm run dev
```

Acesse `http://localhost:5173`, arraste um vídeo para a página e clique em **Gerar legenda**.

> Sem o `.env.local` a página abre, mas avisa **"Sem GEMINI_API_KEY"** e cada trecho responde **"Configure a GEMINI_API_KEY..."**.

> ⏳ Na **primeira** legenda, o navegador baixa o núcleo do ffmpeg.wasm (~31 MB, ~10 MB com gzip). Depois ele fica no cache.

## 🔑 Como criar a sua chave do Gemini (Google AI Studio)

1. Acesse [aistudio.google.com/apikey](https://aistudio.google.com/apikey) e entre com uma conta Google.
   > Se a sua conta institucional não tiver acesso ao AI Studio, use uma conta Gmail pessoal.
2. Aceite os termos de uso, se for o primeiro acesso.
3. Clique em **Create API key** (Criar chave de API) e escolha um projeto do Google Cloud (ou deixe o AI Studio criar um).
4. **Copie a chave** (começa com `AIza`).

Sobre o plano gratuito:

- Não precisa de cartão de crédito; há um limite de pedidos por minuto e por dia (veja os valores atuais em [ai.google.dev/gemini-api/docs/rate-limits](https://ai.google.dev/gemini-api/docs/rate-limits)). Um vídeo de **1 hora** em trechos de 3 minutos usa **20 pedidos**.
- Quando a cota por minuto acaba, a página **espera e tenta de novo sozinha** (até 3 vezes por trecho).
- No plano gratuito, o Google pode usar o áudio enviado para melhorar os produtos dele: **não use vídeos com conteúdo sigiloso**.

> ⚠️ A chave é **secreta**: quem tiver a chave gasta a sua cota. Nunca coloque no código nem no GitHub.

## 🔐 Configurando o `.env.local`

O `.env.local` guarda as variáveis de ambiente **só na sua máquina**: ele está no `.gitignore` e **não vai para o GitHub**.

1. Copie o modelo:

   ```bash
   cp .env.example .env.local
   ```

2. Preencha:

   ```properties
   GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

   # Opcional: trocar o modelo (padrão: gemini-3.5-flash-lite)
   # GEMINI_MODEL=gemini-3.5-flash
   ```

3. **Reinicie** o `npm run dev`.

> 💡 **Por que não `VITE_GEMINI_API_KEY`?** Tudo que começa com `VITE_` vai **dentro do JavaScript** do navegador, e qualquer visitante conseguiria copiar a chave. Sem o prefixo, ela é lida **só no servidor**: pelo `vite.config.js` no `npm run dev` e pela **Vercel Function** `api/subtitles.js` em produção. A página só pergunta ao servidor **se** há chave, para mostrar o aviso abaixo do formulário.

> 🎯 **Qual modelo usar?** O `gemini-3.5-flash-lite` é rápido e tem boa cota grátis. Para áudios difíceis (ruído, sotaque forte, várias pessoas falando), o `gemini-3.5-flash` costuma acertar mais os tempos e a tradução.

## ☁️ Deploy na Vercel (variável de ambiente)

1. Suba o projeto para um repositório no GitHub.
2. Em [vercel.com/new](https://vercel.com/new), clique em **Import** no repositório (preset **Vite**).
3. Abra **Environment Variables** e cadastre:

   | Key | Value |
   | --- | --- |
   | `GEMINI_API_KEY` | `AIza...` |
   | `GEMINI_MODEL` (opcional) | `gemini-3.5-flash` |

4. Clique em **Deploy**.

Se o projeto já estiver publicado: **Settings** → **Environment Variables** → adicione `GEMINI_API_KEY` (marque **Production**, **Preview** e **Development**) → **Save** → **Deployments** → três pontinhos do último deploy → **Redeploy**.

> O `vercel.json` dá até **60 segundos** para a função `api/subtitles.js` responder (cada trecho de 3 minutos leva, em geral, de 10 a 30 segundos).

> ⚠️ Em hospedagem **só estática** (GitHub Pages, por exemplo) a página abre, mas não há a rota `/api/subtitles`: ela avisa *"A rota /api/subtitles não existe aqui"*.

## ⚙️ Como funciona

```text
Navegador                                                     Servidor (vite.config.js ou api/subtitles.js)
─────────                                                     ─────────────────────────────────────────────
vídeo.mp4 / .avi / .mkv
   │  ffmpeg.wasm (WORKERFS: lê direto do disco)
   ▼
chunk_000.mp3  chunk_001.mp3  ...   mono · 16 kHz · 32 kbps (~240 KB por minuto)
   │
   ├──POST /api/subtitles { audio (base64), duration, language, context }──▶  + GEMINI_API_KEY + regras de legendagem
   │                                                                          │
   │                                                                          ▼
   │                                               generativelanguage.googleapis.com
   │                                               /v1beta/models/{modelo}:generateContent
   │                                               (responseSchema → JSON garantido)
   │◀──────────── { language, segments: [{ start, end, text }] } ─────────────┘
   ▼
soma o início do trecho → normaliza (src/core/cues.js) → .srt
```

**1. Áudio (no navegador)**

1. O vídeo é **montado** no ffmpeg.wasm com o `WORKERFS`: nada é copiado para a memória, então vídeos de vários GB funcionam;
2. o ffmpeg pega a **primeira faixa de áudio**, converte para MP3 mono de 16 kHz e divide em trechos com o *muxer* `segment` (o `chunks.csv` diz o início exato de cada trecho);
3. a barra de progresso acompanha o `time=` do log do ffmpeg.

**2. Gemini (no servidor, trecho por trecho)**

1. Cada trecho vai como `inlineData` (`audio/mp3`) com a instrução de sistema (legendador profissional, pt-BR, até 84 caracteres, 1 a 7 s, não inventar falas);
2. o `responseSchema` obriga a resposta a vir em JSON: `{ language, segments: [{ start, end, text }] }`, com tempos em segundos **relativos ao trecho**;
3. o idioma detectado no 1º trecho vira **dica** para os próximos, e as **3 últimas legendas** de cada trecho vão como **contexto** para o seguinte;
4. o servidor limpa o que voltou (tempos válidos, texto sem espaços extras, dentro da duração do trecho).

**3. Ajuste das legendas (`src/core/cues.js`, no navegador)**

1. Soma o início do trecho a cada tempo e **remove repetições** na emenda entre dois trechos;
2. **divide** legendas com texto demais para 2 linhas (preferindo o fim de uma frase ou uma vírgula), com o tempo proporcional ao texto;
3. garante **1 s** mínimo e **7 s** máximo na tela e **80 ms** entre uma legenda e a próxima;
4. **quebra a linha** em duas partes equilibradas, sem deixar "a", "de", "o" sozinhos no fim da linha; diálogos (`- Oi. - Tudo bem?`) viram uma fala por linha.

**Na página**

- O processamento não trava a tela: barra de progresso e botão **Cancelar** (ou `Esc`), com `AbortController` (o cancelamento encerra o worker do ffmpeg);
- Se um trecho falhar de vez, as legendas **dos trechos que já ficaram prontos** continuam na tela e podem ser baixadas;
- **Revisão**: a legenda do player é uma `TextTrack` criada em JavaScript (`VTTCue`), então qualquer correção na tabela aparece no vídeo na hora;
- A coluna **c/s** (caracteres por segundo) fica vermelha acima de **20**: a legenda passa rápido demais para ler;
- **Baixar .srt** (`Ctrl+S` / `Cmd+S`): o arquivo tem o **mesmo nome do vídeo** + `.pt-BR.srt`, em UTF-8 com BOM (acentos corretos em TVs e players antigos):

```text
1
00:00:01,200 --> 00:00:04,100
Olá, pessoal!
Sejam bem-vindos à primeira aula do curso.

2
00:00:04,400 --> 00:00:08,000
Hoje vamos entender o que é o React
e por que ele é tão usado.
```

> 💡 Com o vídeo e o `.srt` na mesma pasta e com o mesmo nome (`aula.mp4` + `aula.pt-BR.srt`), o **VLC** carrega a legenda sozinho.

> ⚠️ **AVI, WMV e FLV**: as legendas são geradas normalmente, mas o navegador não reproduz esses formatos, então a pré-visualização mostra um aviso. Assista no VLC.

> ⚠️ **Tempos**: o Gemini sincroniza bem a maior parte das falas, mas pode errar alguns décimos de segundo, principalmente em trechos longos. Se precisar de mais precisão, use trechos de **2 minutos**.

## 🛠️ Configurações

Tudo fica em `src/config/subtitlesConfig.js`:

```js
DEFAULT_CHUNK_SECONDS: 180, // tamanho de cada trecho de áudio
DEFAULT_MAX_LINE: 42,       // caracteres por linha
MAX_LINES: 2,               // linhas por legenda
MIN_DURATION: 1,            // segundos na tela, no mínimo
MAX_DURATION: 7,            // ... e no máximo
MAX_RETRIES: 3,             // novas tentativas quando a cota acaba
SRT_SUFFIX: ".pt-BR.srt",
SRT_BOM: true,
```

As regras que o Gemini segue ficam em `SYSTEM`, no `api/_subtitles.js`.

Proteções da rota (`api/_subtitles.js`): corpo de até **4 MB** (abaixo do limite de 4,5 MB da Vercel), trechos de até **6 minutos**, só formatos de áudio conhecidos, **30 trechos por minuto** e **400 por dia** por IP, e a chamada ao Gemini é cancelada se o visitante fechar a página.

## 📂 Estrutura do Projeto

```text
📁 SubtitlesGenerator
│
├── 📁 api
│   ├── _subtitles.js    └── Chama o Gemini com o áudio do trecho, regras de legendagem e limites
│   └── subtitles.js     └── Vercel Function: GET (status) e POST /api/subtitles
│
├── 📁 imgs              └── Capturas de tela usadas neste README
├── 📁 public            └── pucminas-logo.png (favicon)
│
├── 📁 src
│   ├── 📁 assets/images └── pucminas-logo.png
│   │
│   ├── 🧩 components
│   │   ├── PageLayout/                       └── Card da página com a faixa azul (logo PUC + logo da API)
│   │   └── SubtitlesGenerator/
│   │       ├── SubtitlesGenerator.jsx        └── Painel completo (formulário + abas)
│   │       ├── UploadForm.jsx                └── Arrastar e soltar o vídeo + opções
│   │       ├── SubtitleStatCards.jsx         └── Indicadores
│   │       ├── SubtitlePreview.jsx           └── Player com a legenda + tabela de revisão
│   │       ├── SrtPreview.jsx                └── Conteúdo do .srt (copiar e baixar)
│   │       ├── ExecutionLog.jsx              └── Log de execução
│   │       ├── useSubtitlesGenerator.js      └── Hook: executa a geração, progresso, cancelamento e edição
│   │       ├── format.js                     └── Formatação pt-BR
│   │       └── SubtitlesGenerator.css
│   │
│   ├── 🧠 core                               └── Regra de negócio (sem React)
│   │   ├── audio.js       └── ffmpeg.wasm: extrai o áudio e divide em trechos
│   │   ├── cues.js        └── Ajuste das legendas (quebra de linha, tempos, divisão)
│   │   ├── srt.js         └── Formato SRT, nome do arquivo e download
│   │   ├── service.js     └── generateSubtitles: vídeo → trechos → Gemini → legendas
│   │   ├── exceptions.js
│   │   └── index.js
│   │
│   ├── ⚙️ config/subtitlesConfig.js
│   ├── 🛠️ services/subtitlesClient.js        └── fetch para /api/subtitles
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── 📄 .env.example
├── 📄 vercel.json       └── maxDuration de 60 s para api/subtitles.js
├── 📄 vite.config.js    └── Atende /api/subtitles no npm run dev + ajustes do ffmpeg.wasm
└── 📄 package.json
```

## 📦 Dependências

```json
"dependencies": {
  "@ffmpeg/core": "^0.12.10",
  "@ffmpeg/ffmpeg": "^0.12.15",
  "react": "^19.2.8",
  "react-dom": "^19.2.8",
  "react-icons": "^5.7.0"
}
```

- [`@ffmpeg/ffmpeg`](https://github.com/ffmpegwasm/ffmpeg.wasm) e [`@ffmpeg/core`](https://www.npmjs.com/package/@ffmpeg/core): o FFmpeg compilado para WebAssembly. O núcleo é importado com `?url`, então o Vite o copia para o build (sem depender de CDN). É a versão *single-thread*: não precisa dos cabeçalhos COOP/COEP.
- [`react-icons`](https://react-icons.github.io/react-icons/): ícones (inclusive o de legenda na faixa azul)
- Sem SDK do Google: a API REST do Gemini é chamada com `fetch`.

> No `vite.config.js`, o `@ffmpeg/ffmpeg` fica fora do `optimizeDeps` e o `worker.format` é `"es"`: sem isso, o Vite quebra o caminho do Web Worker do ffmpeg.wasm.

## 🧪 Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento (com a rota `/api/subtitles`) |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Testa o build localmente (também atende `/api/subtitles`) |
| `npm run lint` | Lint com o oxlint (padrão do template atual do Vite) |

## 📚 Documentação e Links Úteis

- 🎧 [Gemini API: Audio understanding](https://ai.google.dev/gemini-api/docs/audio)
- 🧾 [Gemini API: Structured output](https://ai.google.dev/gemini-api/docs/structured-output)
- 🎞️ [ffmpeg.wasm](https://ffmpegwasm.netlify.app/docs/overview)
- 📝 [Formato SubRip (.srt)](https://en.wikipedia.org/wiki/SubRip)
- 🎬 [Netflix: Brazilian Portuguese Timed Text Style Guide](https://partnerhelp.netflixstudios.com/hc/en-us/articles/215600497-Brazilian-Portuguese-Timed-Text-Style-Guide)
- ⚡ [Vite](https://vite.dev/) · ⚛️ [React](https://react.dev/)

## 📄 Licença
Este projeto está licenciado sob a MIT License.
