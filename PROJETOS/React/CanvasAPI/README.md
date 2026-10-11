# Projeto CanvasAPI (React + Vite) 🎓

## 📖 Descrição

Painel das suas disciplinas no **Canvas LMS** (o Canvas da PUC Minas), feito com **React** e **Vite** e lido ao vivo da **API REST do Canvas**: cursos, tarefas, prazos, entregas e eventos do calendário.

Funciona com a conta de **professor** e com a de **aluno**:

| | Professor 👩‍🏫 | Aluno 🧑‍🎓 |
| --- | --- | --- |
| Cada tarefa mostra | quantos entregaram (barra) e quantas entregas esperam correção | se você já entregou, se está atrasada e a nota |
| Indicador | **A corrigir** | **Atrasadas** |
| Tabela de cursos | % de entregas e "a corrigir" por curso | % de tarefas entregues e atrasadas por curso |

O que o projeto mostra:

- **Próxima entrega** em destaque, com contagem regressiva que anda sozinha
- **Indicadores**: cursos (e alunos), entregas da semana, a corrigir/atrasadas e eventos do calendário
- **Resumo**: o que vence nos próximos 7 dias + uma linha por curso
- **Tarefas**: pela frente, vencidas (últimos 21 dias) e sem prazo
- **Agenda**: tarefas e eventos do calendário (provas, apresentações...) dia a dia
- **Filtro por curso**, com um nome curto e uma cor para cada um ("DIAW · Manhã", "DIAW · Noite"...)

A ideia é que você copie o componente `<CanvasDashboard />` para o **seu portfólio** ou para qualquer outro projeto React.

## 🖼️ Capturas de Tela

| Resumo | Agenda |
| :---: | :---: |
| ![Resumo](https://joaopauloaramuni.github.io/react-imgs/CanvasAPI/imgs/Resumo.png) | ![Agenda](https://joaopauloaramuni.github.io/react-imgs/CanvasAPI/imgs/Agenda.png) |

| Tarefas | Celular |
| :---: | :---: |
| ![Tarefas](https://joaopauloaramuni.github.io/react-imgs/CanvasAPI/imgs/Tarefas.png) | ![Mobile](https://joaopauloaramuni.github.io/react-imgs/CanvasAPI/imgs/Mobile.png) |

## 🚀 Como rodar

```bash
npm install
cp .env.example .env.local   # depois coloque o seu CANVAS_TOKEN
npm run dev
```

Acesse `http://localhost:5173`.

> Sem o `.env.local` o projeto abre normalmente, mas o painel mostra o aviso **"Configure CANVAS_TOKEN..."**.

## 🔑 Como criar o token no Canvas

1. Entre no Canvas: [pucminas.instructure.com](https://pucminas.instructure.com).
2. Clique na sua foto (**Conta**) no menu da esquerda → **Configurações**.
3. Role até **Integrações aprovadas** e clique em **+ Novo token de acesso**.
4. Preencha:
   - **Finalidade**: `Painel React - CanvasAPI`
   - **Expira**: escolha uma data (anote para renovar depois)
5. Clique em **Gerar token** e **copie o token agora**: o Canvas não mostra de novo.

> ⚠️ O token tem **as mesmas permissões que você** no Canvas (inclusive ver notas e mandar mensagens). Nunca coloque no código, em prints ou no GitHub. Se vazar, apague em **Integrações aprovadas** e gere outro.

> 💡 Algumas instituições desativam a criação de tokens para alunos. Se o botão **+ Novo token de acesso** não aparecer, fale com o suporte do Canvas da sua instituição.

## 🔐 Configurando o `.env.local`

O `.env.local` guarda as variáveis de ambiente **só na sua máquina**: ele está no `.gitignore` e **não vai para o GitHub**.

1. Copie o modelo:

   ```bash
   cp .env.example .env.local
   ```

2. Preencha:

   ```properties
   CANVAS_TOKEN=12345~xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

   # Endereço do Canvas da sua instituição (padrão: PUC Minas)
   CANVAS_URL=https://pucminas.instructure.com

   # Opcional: só estes cursos (ids separados por vírgula). Vazio = todos os ativos
   CANVAS_COURSES=292753,290578
   ```

3. **Reinicie** o `npm run dev` (o Vite só lê o `.env.local` quando inicia).

> 💡 **Por que a variável não começa com `VITE_`?** Tudo que começa com `VITE_` é colocado **dentro do JavaScript** que vai para o navegador, e qualquer visitante consegue ler. Por isso o token fica sem o prefixo e é lido **só no servidor**: pelo `vite.config.js` no `npm run dev` e pela **Vercel Function** `api/canvas.js` em produção.

O **id do curso** está na URL dele no Canvas: `pucminas.instructure.com/courses/`**`292753`**.

## ☁️ Deploy na Vercel (variável de ambiente)

1. Suba o projeto para um repositório no GitHub (o `.env.local` **não** vai junto, e é isso mesmo).
2. Em [vercel.com/new](https://vercel.com/new), clique em **Import** no repositório. O preset **Vite** é detectado sozinho.
3. Antes de clicar em **Deploy**, abra **Environment Variables** e cadastre:

   | Key | Value |
   | --- | --- |
   | `CANVAS_TOKEN` | o seu token |
   | `CANVAS_URL` | `https://pucminas.instructure.com` (opcional) |
   | `CANVAS_COURSES` | opcional, ex.: `292753,290578` |

4. Clique em **Deploy**.

Se o projeto já estiver publicado: **Settings** → **Environment Variables** → adicione as variáveis (marque **Production**, **Preview** e **Development**) → **Save** → **Deployments** → três pontinhos do último deploy → **Redeploy**.

> ⚠️ **Atenção:** publicado, o painel mostra os dados da conta do token para **qualquer pessoa** que abrir o site. Por isso a resposta leva só cursos, tarefas, prazos, eventos e **contagens** de entregas: nomes, e-mails e notas de alunos nunca saem do servidor. Com token de **aluno**, as suas próprias notas aparecem: publique só se não se importar.

## ⚙️ Como funciona

```text
Navegador ──GET /api/canvas──▶ vite.config.js (npm run dev) ou api/canvas.js (Vercel)
                                       │  + CANVAS_TOKEN (Authorization: Bearer ...)
                                       ▼
          GET /api/v1/users/self                                     quem é você
          GET /api/v1/courses?enrollment_state=active&include[]=term   cursos ativos
          GET /api/v1/courses/:id/assignments?include[]=submission     tarefas (+ a sua entrega, se aluno)
          GET /api/v1/courses/:id/assignments/:id/submission_summary   entregues/corrigidas (professor)
          GET /api/v1/calendar_events?context_codes[]=course_:id       eventos do calendário
```

- O Canvas **não libera CORS** e o token **não pode ir para o navegador**: por isso existe a rota `/api/canvas` no próprio site, que junta tudo numa resposta só.
- O token vai no cabeçalho `Authorization: Bearer <token>`, como pede a [documentação do Canvas](https://canvas.instructure.com/doc/api/).
- O Canvas devolve **no máximo 100 itens por página**; a próxima página vem no cabeçalho `Link` (`rel="next"`), e o servidor segue as páginas sozinho.
- As chamadas por curso rodam **4 de cada vez**, para não estourar o limite de requisições do Canvas.
- **Professor ou aluno?** O servidor olha o tipo da matrícula em cada curso (`teacher`, `ta`, `student`...). Professor recebe `needs_grading_count` e o resumo de entregas; aluno recebe a própria entrega (`submission`).
- O resumo de entregas (`submission_summary`) custa **uma chamada por tarefa**: por isso ele só é buscado para as 25 tarefas com prazo mais perto de hoje.
- Cursos de semestres que já acabaram ficam de fora (o Canvas às vezes mantém a matrícula "ativa").
- A resposta fica **1 minuto** na memória da função e no cache da CDN da Vercel, e a página busca de novo a cada **5 minutos**.

Para ver a resposta crua, rode `npm run dev` e acesse `http://localhost:5173/api/canvas`.

## 🧩 Usando no seu projeto

Copie para o seu projeto React + Vite:

```text
api/_canvas.js                    → lógica (servidor)
api/canvas.js                     → Vercel Function /api/canvas
src/config/canvasConfig.js        → seção inicial, dias da agenda, nomes e cores dos cursos
src/services/canvasService.js     → fetch para /api/canvas
src/components/Canvas/            → componentes + CSS
```

Junte o plugin `canvasApi(env)` ao seu `vite.config.js` (veja o deste projeto) e use:

```jsx
import CanvasDashboard from "./components/Canvas/CanvasDashboard";

<CanvasDashboard />
<CanvasDashboard initialSection="agenda" />
```

Opções em `src/config/canvasConfig.js`:

| Opção | Padrão | O que faz |
| --- | --- | --- |
| `DEFAULT_SECTION` | `"resumo"` | Seção aberta ao carregar (`resumo`, `tarefas` ou `agenda`) |
| `WEEK_DAYS` | `7` | Dias do "Esta semana" e do "Próximos dias" |
| `AGENDA_DAYS` | `21` | Dias mostrados na agenda |
| `OVERDUE_DAYS` | `21` | Tarefas vencidas há até N dias aparecem em "Vencidas" |
| `REFRESH_MINUTES` | `5` | De quanto em quanto tempo a página busca de novo |
| `COURSE_LABELS` | `{}` | Nome curto de cada curso, ex.: `{ "292753": "DIAW G1" }` |
| `COURSE_COLORS` | 8 cores | Cor de cada curso, na ordem do Canvas |

> Sem `COURSE_LABELS`, o painel monta as iniciais da disciplina ("Desenvolvimento e Integração de Aplicações Web" → **DIAW**) e, se duas turmas tiverem a mesma sigla, junta o pedaço do nome que muda ("DIAW · Manhã", "DIAW · Noite").

## 📂 Estrutura do Projeto

```text
📁 CanvasAPI
│
├── 📁 api
│   ├── _canvas.js       └── Chama o Canvas com o token, segue a paginação e normaliza a resposta
│   └── canvas.js        └── Vercel Function: GET /api/canvas
│
├── 📁 imgs              └── Capturas de tela usadas neste README
├── 📁 public            └── pucminas-logo.png (favicon)
│
├── 📁 src
│   ├── 📁 assets/images └── pucminas-logo.png
│   │
│   ├── 🧩 components
│   │   ├── PageLayout/              └── Card da página com a faixa azul (logo PUC + logo do Canvas)
│   │   └── Canvas/
│   │       ├── CanvasDashboard.jsx  └── Usuário, indicadores, próxima entrega, abas e filtro
│   │       ├── Sections.jsx         └── Resumo, Tarefas e Agenda
│   │       ├── Parts.jsx            └── Tarefa, evento, folhinha, etiqueta do curso, contagem regressiva
│   │       ├── canvasUtils.js       └── Situação das tarefas, nomes curtos dos cursos, datas (pt-BR)
│   │       └── Canvas.css
│   │
│   ├── ⚙️ config/canvasConfig.js
│   ├── 🛠️ services/canvasService.js
│   ├── App.jsx
│   ├── index.css               └── Reset, variáveis de cor e fundo da página
│   └── main.jsx
│
├── 📄 .env.example
├── 📄 vite.config.js    └── Atende /api/canvas no npm run dev
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

- [`react-icons`](https://react-icons.github.io/react-icons/): ícones (inclusive o logo do Canvas na faixa azul)
- Nenhuma biblioteca para chamar a API: só `fetch`.

## 🧪 Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento (com a rota `/api/canvas`) |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Testa o build localmente (também atende `/api/canvas`) |
| `npm run lint` | Lint com o oxlint (padrão do template atual do Vite) |

## 📄 Licença
Este projeto está licenciado sob a MIT License.
