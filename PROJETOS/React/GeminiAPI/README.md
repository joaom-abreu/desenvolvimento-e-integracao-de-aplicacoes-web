# Projeto GeminiAPI (React + Vite) ✨

## 📖 Descrição

Chat **"Pergunte sobre mim"** feito com **React** e **Vite** e a API do **Google Gemini**. O visitante do seu portfólio faz perguntas e a IA responde **em primeira pessoa, como se fosse você**, usando só as informações que você escreveu em `api/_perfil.js` (formação, experiência, projetos, habilidades, contato...).

Recursos:

- Respostas em **streaming** (o texto vai aparecendo enquanto o Gemini escreve)
- **Perguntas prontas** para começar a conversa
- A conversa tem **contexto**: as últimas mensagens vão junto ("e antes disso?")
- Botões **parar** e **nova conversa**; **Enter** envia e **Shift+Enter** quebra a linha
- Markdown simples nas respostas (**negrito**, listas), sem `innerHTML`
- A chave fica **só no servidor**, com **limite de perguntas por visitante**

## 🖼️ Capturas de Tela

| Início | Conversa |
| :---: | :---: |
| ![Home](https://joaopauloaramuni.github.io/react-imgs/GeminiAPI/imgs/Home.png) | ![Conversa](https://joaopauloaramuni.github.io/react-imgs/GeminiAPI/imgs/Conversa.png) |

| Celular |
| :---: |
| ![Mobile](https://joaopauloaramuni.github.io/react-imgs/GeminiAPI/imgs/Mobile.png) |

## 🚀 Como rodar

```bash
npm install
cp .env.example .env.local   # depois coloque a sua GEMINI_API_KEY
npm run dev
```

Acesse `http://localhost:5173`.

> Sem o `.env.local` o chat abre, mas cada pergunta responde **"Configure a GEMINI_API_KEY..."**.

## 🔑 Como criar a sua chave do Gemini (Google AI Studio)

1. Acesse [aistudio.google.com/apikey](https://aistudio.google.com/apikey) e entre com uma conta Google.
   > Se a sua conta institucional não tiver acesso ao AI Studio, use uma conta Gmail pessoal.
2. Aceite os termos de uso, se for o primeiro acesso.
3. Clique em **Create API key** (Criar chave de API) e escolha um projeto do Google Cloud (ou deixe o AI Studio criar um).
4. **Copie a chave** (começa com `AIza`).

Sobre o plano gratuito:

- Não precisa de cartão de crédito; há um limite de perguntas por minuto e por dia (veja os valores atuais em [ai.google.dev/gemini-api/docs/rate-limits](https://ai.google.dev/gemini-api/docs/rate-limits)).
- No plano gratuito, o Google pode usar as perguntas e respostas para melhorar os produtos dele: **não coloque dados pessoais sensíveis** no perfil.

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
   # GEMINI_MODEL=gemini-3.5-flash-lite
   ```

3. **Reinicie** o `npm run dev`.

> 💡 **Por que não `VITE_GEMINI_API_KEY`?** Tudo que começa com `VITE_` vai **dentro do JavaScript** do navegador, e qualquer visitante conseguiria copiar a chave. Sem o prefixo, ela é lida **só no servidor**: pelo `vite.config.js` no `npm run dev` e pela **Vercel Function** `api/gemini.js` em produção.

## ✏️ Escrevendo o SEU perfil

Edite `api/_perfil.js`. É um texto livre em tópicos que vai inteiro como **instrução de sistema** em cada pergunta:

```js
export const NOME = "Seu Nome";

export const PERFIL = `
# Quem sou
- ...
# Experiência
- ...
# Projetos
- ...
# Habilidades
- ...
# Contato
- ...
`;
```

As regras de resposta (primeira pessoa, respostas curtas, não inventar nada, usar só o perfil) ficam em `SYSTEM`, no `api/_gemini.js`. O nome do chat, a mensagem de boas-vindas e as perguntas prontas ficam em `src/config/geminiConfig.js`.

## ☁️ Deploy na Vercel (variável de ambiente)

1. Suba o projeto para um repositório no GitHub.
2. Em [vercel.com/new](https://vercel.com/new), clique em **Import** no repositório (preset **Vite**).
3. Abra **Environment Variables** e cadastre:

   | Key | Value |
   | --- | --- |
   | `GEMINI_API_KEY` | `AIza...` |
   | `GEMINI_MODEL` (opcional) | `gemini-3.5-flash-lite` |

4. Clique em **Deploy**.

Se o projeto já estiver publicado: **Settings** → **Environment Variables** → adicione `GEMINI_API_KEY` (marque **Production**, **Preview** e **Development**) → **Save** → **Deployments** → três pontinhos do último deploy → **Redeploy**.

> O `vercel.json` dá até **60 segundos** para a função `api/gemini.js` responder (respostas em streaming podem levar alguns segundos).

## ⚙️ Como funciona

```text
Navegador ──POST /api/gemini { message, history }──▶ vite.config.js (dev) ou api/gemini.js (Vercel)
     ▲                                                        │ + GEMINI_API_KEY + perfil (_perfil.js)
     │  texto em streaming (text/plain)                       ▼
     └──────────────────────────────────── generativelanguage.googleapis.com
                                           /v1beta/models/{modelo}:streamGenerateContent?alt=sse
```

- O servidor monta o pedido para o Gemini com `systemInstruction` (regras + perfil), o histórico e a pergunta.
- O Gemini responde em **SSE** (`data: {...}`); o servidor tira o texto de cada evento e repassa ao navegador aos pedaços.
- No navegador, `response.body.getReader()` lê os pedaços e o React atualiza a bolha da resposta.
- Proteções em `api/_gemini.js`: só `POST`, pergunta de até **1.000** caracteres, histórico de até **10** mensagens, **8 perguntas por minuto** e **100 por dia** por IP, e a chamada é cancelada se o visitante fechar a página.

## 🧩 Usando no seu projeto

Copie para o seu projeto React + Vite:

```text
api/_gemini.js                    → lógica (servidor) + regras da IA
api/_perfil.js                    → o que a IA sabe sobre você
api/gemini.js                     → Vercel Function
vercel.json                       → maxDuration da função
src/config/geminiConfig.js        → nome, boas-vindas, perguntas prontas
src/services/geminiService.js     → fetch com streaming
src/components/GeminiChat/        → componente + CSS
```

Junte o plugin `geminiApi(env)` ao seu `vite.config.js` (veja o deste projeto) e use:

```jsx
import GeminiChat from "./components/GeminiChat/GeminiChat";

<GeminiChat />
```

## 📂 Estrutura do Projeto

```text
📁 GeminiAPI
│
├── 📁 api
│   ├── _gemini.js       └── Chama o Gemini (streaming), limites e regras da IA
│   ├── _perfil.js       └── SEU perfil (texto que a IA usa para responder)
│   └── gemini.js        └── Vercel Function: POST /api/gemini
│
├── 📁 imgs              └── Capturas de tela usadas neste README
├── 📁 public            └── pucminas-logo.png (favicon)
│
├── 📁 src
│   ├── 📁 assets/images └── pucminas-logo.png
│   │
│   ├── 🧩 components
│   │   ├── PageLayout/          └── Card da página com a faixa azul (logo PUC + logo da API)
│   │   └── GeminiChat/
│   │       ├── GeminiChat.jsx   └── Chat (mensagens, perguntas prontas, parar, nova conversa)
│   │       ├── MarkdownText.jsx └── Negrito, itálico, código e listas, sem innerHTML
│   │       └── GeminiChat.css
│   │
│   ├── ⚙️ config/geminiConfig.js
│   ├── 🛠️ services/geminiService.js
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
│
├── 📄 .env.example
├── 📄 vercel.json       └── maxDuration de 60 s para api/gemini.js
├── 📄 vite.config.js    └── Atende /api/gemini no npm run dev
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

- [`react-icons`](https://react-icons.github.io/react-icons/): ícones (inclusive o logo do Gemini na faixa azul)
- Sem SDK do Google: a API REST do Gemini é chamada com `fetch`.

## 🧪 Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento (com a rota `/api/gemini`) |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Testa o build localmente (também atende `/api/gemini`) |
| `npm run lint` | Lint com o oxlint (padrão do template atual do Vite) |

## 📄 Licença
Este projeto está licenciado sob a MIT License.
