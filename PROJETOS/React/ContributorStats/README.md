# Projeto ContributorStats (React + Vite) 🏆

## 📖 Descrição

Versão em **React** e **Vite** do [Projeto GitHubAPI ContributorStats 2](https://github.com/joaopauloaramuni/python/tree/main/PROJETOS/Projeto%20GitHubAPI%20ContributorStats_2) (Python). Analisa um repositório do GitHub (público ou **privado**) e gera um **ranking dos colaboradores** com base em métricas reais de código: **commits**, **linhas inseridas**, **linhas deletadas** e **impacto líquido** (inseridas − deletadas).

A regra de negócio é a mesma do projeto Python, só que portada para JavaScript:

- 🌿 **Todas as branches** (padrão), e não só o que já foi mergeado na `main`;
- 🧹 commits **deduplicados**: pelo SHA (mesmo commit em várias branches) e por "impressão digital" (cópias de *rebase*/*cherry-pick*);
- 🔀 commits de *merge* ignorados (opção para contá-los);
- 📍 coluna **Fora da padrão**: quantos commits de cada pessoa ainda não estão na branch padrão, e em quais branches;
- ⏳ modo **só a branch padrão** via `/stats/contributors`, com *polling* do `202 Accepted` e busca em paralelo da data exata do último commit.

| Componente | O que mostra |
| --- | --- |
| `<AnalysisForm />` | Repositório, critério do ranking e opções (todas as branches, merges, data exata) |
| `<ContributorStatCards />` | Colaboradores, commits, linhas inseridas e deletadas (com impacto líquido) |
| `<RankingTable />` | Ranking com Top 3 em destaque, ordenação pelo cabeçalho, filtro, branches não mergeadas, copiar usuário e exportar CSV |
| `<TopContributorsChart />` | Gráfico de barras Top 10 por commits, inseridas, deletadas ou impacto líquido |
| `<ExecutionLog />` | Log de execução com cada etapa da análise |
| `<ContributorStats />` | Todos os anteriores + barra de status/progresso + abas |

## 🖼️ Capturas de Tela

| Ranking | Branches não mergeadas |
| :---: | :---: |
| ![Home](https://joaopauloaramuni.github.io/react-imgs/ContributorStats/imgs/Home.png) | ![Branches](https://joaopauloaramuni.github.io/react-imgs/ContributorStats/imgs/Branches.png) |

| Log de execução | Celular |
| :---: | :---: |
| ![Log](https://joaopauloaramuni.github.io/react-imgs/ContributorStats/imgs/Log.png) | ![Mobile](https://joaopauloaramuni.github.io/react-imgs/ContributorStats/imgs/Mobile.png) |

> As capturas usam dados de exemplo (`aluno1`…`aluno6`), como no projeto Python.

## 🚀 Como rodar

```bash
npm install
cp .env.example .env.local   # preencha o GITHUB_TOKEN
npm run dev
```

Acesse `http://localhost:5173`, cole a URL do repositório e clique em **Analisar repositório**.

> 🔑 O token é **obrigatório** para analisar **todas as branches** (a API GraphQL do GitHub não aceita acesso anônimo) e para repositórios **privados**. Sem token, só funciona o modo **só a branch padrão** em repositórios públicos (60 chamadas por hora por IP).

O repositório que aparece ao abrir a página fica em `src/config/contributorStatsConfig.js`:

```js
DEFAULT_REPO_URL: "https://github.com/dono/repositorio",
```

A URL aceita `https://github.com/dono/repo`, `.git`, links com `/tree/...`, SSH (`git@github.com:dono/repo.git`) ou só `dono/repo`.

## 🔑 Como criar o token do GitHub

**Opção 1: fine-grained (recomendado)**

1. Abra [github.com/settings/personal-access-tokens](https://github.com/settings/personal-access-tokens) (**Settings** → **Developer settings** → **Personal access tokens** → **Fine-grained tokens**) e clique em **Generate new token**.
2. **Resource owner**: você ou a organização dona dos repositórios (a organização pode precisar aprovar o token).
3. **Repository access**: **Only select repositories** (ou **All repositories**).
4. **Permissions** → **Repository permissions**: **Contents: Read-only** (o **Metadata: Read-only** entra automaticamente).
5. Clique em **Generate token** e **copie o token agora** (começa com `github_pat_`).

**Opção 2: classic**

Em [github.com/settings/tokens](https://github.com/settings/tokens) → **Generate new token (classic)** → marque o escopo **`repo`** (necessário para privados; para públicos, nenhum escopo basta).

> ⚠️ O token é **secreto**: nunca coloque no código nem no GitHub. O GitHub detecta tokens publicados e os revoga automaticamente.

## 🔐 Configurando o `.env.local`

O `.env.local` guarda as variáveis de ambiente **só na sua máquina**: ele está no `.gitignore` e **não vai para o GitHub**.

1. Copie o modelo:

   ```bash
   cp .env.example .env.local
   ```

2. Preencha:

   ```properties
   GITHUB_TOKEN=github_pat_xxxxxxxxxxxxxxxxxxxxxx

   # Opcional: donos permitidos (usuários/organizações), separados por vírgula
   GITHUB_ALLOWED_OWNERS=
   ```

3. **Reinicie** o `npm run dev`.

> 💡 **Por que não `VITE_GITHUB_TOKEN`?** Tudo que começa com `VITE_` vai **dentro do JavaScript** do navegador, e qualquer visitante consegue ler. Sem o prefixo, o token é lido **só no servidor**: pelo `vite.config.js` no `npm run dev` e pela **Vercel Function** `api/github.js` em produção. A página só pergunta ao servidor **se** há token, para mostrar o aviso abaixo do formulário.

> 🛡️ **`GITHUB_ALLOWED_OWNERS`**: se o seu token enxerga repositórios privados e o site for publicado, **qualquer visitante** consegue analisá-los pela página. Preencha essa variável (ex.: `ICEI-PUC-Minas-CC-TI,seu-usuario`) para limitar os donos aceitos pelo servidor.

## ☁️ Deploy na Vercel (variáveis de ambiente)

1. Suba o projeto para um repositório no GitHub.
2. Em [vercel.com/new](https://vercel.com/new), clique em **Import** no repositório (preset **Vite**).
3. Abra **Environment Variables** e cadastre:

   | Key | Value |
   | --- | --- |
   | `GITHUB_TOKEN` | `github_pat_...` |
   | `GITHUB_ALLOWED_OWNERS` | (opcional) `org1,usuario2` |

4. Clique em **Deploy**.

Se o projeto já estiver publicado: **Settings** → **Environment Variables** → adicione as variáveis (marque **Production**, **Preview** e **Development**) → **Save** → **Deployments** → três pontinhos do último deploy → **Redeploy**.

## ⚙️ Como funciona

A regra de negócio (polling, deduplicação, ranking, CSV) roda **no navegador**, em `src/core`. O servidor só faz as chamadas ao GitHub com o token, e aceita apenas os recursos abaixo, com parâmetros validados: a rota não vira uma "porta aberta" para gastar o token.

```text
Navegador ──GET /api/github?resource=...──▶ vite.config.js (dev) ou api/github.js (Vercel)
 (src/core)                                         │ + GITHUB_TOKEN
                                                    ▼
          status       → { hasToken }  (o token nunca sai do servidor)
          branches     → GraphQL repository.refs            (uma página de branches)
          history      → GraphQL object(oid).history        (uma página de commits)
          stats        → GET /repos/:owner/:repo/stats/contributors  (ready | computing | empty)
          last-commit  → GET /repos/:owner/:repo/commits?author=...&per_page=1
          commits      → GET /repos/:owner/:repo/commits?per_page=100&page=N  (aba Tipos de arquivo)
          commit       → GET /repos/:owner/:repo/commits/:sha   (arquivos alterados no commit)
```

**Todas as branches (padrão)**

1. Lista as branches (a padrão primeiro) via GraphQL;
2. percorre o histórico de cada branch, página a página (se o GitHub der *timeout*, o tamanho da página cai pela metade e tenta de novo);
3. conta cada commit **uma vez só** (SHA e impressão digital: autor + data de autoria + mensagem + linhas);
4. ignora *merges* (a menos que **Contar commits de merge** esteja marcado);
5. agrega por autor: commits, linhas, data exata do último commit e commits fora da branch padrão.

**Só a branch padrão** (desmarque **Considerar todas as branches**)

1. `/stats/contributors` com *polling* enquanto o GitHub responde `202` (até 6 tentativas, 10 s entre elas, cancelável);
2. data do último commit aproximada pela semana (`~`) e, opcionalmente, exata (até 8 requisições em paralelo).

**Na página**

- A análise não trava a tela: barra de progresso e botão **Cancelar** (ou `Esc`), com `AbortController`;
- Trocar o critério do ranking **reordena sem nova consulta à API**;
- **Exportar CSV** (`Ctrl+E` / `Cmd+E`): separado por `;`, UTF-8 com BOM (acentos corretos no Excel), mesmo formato do projeto Python:

```text
Posição;Nome de Usuário;URL Perfil;Commits Totais;Linhas Inseridas;Linhas Deletadas;Impacto Líquido (Ins - Del);Último Commit;Commits Fora da Branch Padrão;Branches (não mergeadas)
1;aluno1;https://github.com/aluno1;77;39;34;5;30/09/2025;4;feature/login, fix/menu
```

**Aba "Tipos de arquivo"**

Mostra em que tipo de arquivo cada colaborador trabalhou, por exemplo: *fulano — 70% CSS (700 linhas) · 30% JavaScript (300 linhas)*.

1. Depois da análise principal, abra a aba e clique em **Analisar tipos de arquivo** (a busca é sob demanda porque custa **1 requisição por commit**);
2. no modo "todas as branches" são usados os mesmos commits do ranking (já deduplicados); no modo "só a branch padrão" os commits são listados via REST;
3. para cada commit, o servidor devolve os arquivos alterados (`caminho`, linhas inseridas e deletadas) — essa resposta fica no cache da CDN, pois um commit nunca muda;
4. cada arquivo é classificado pela extensão (CSS, JavaScript, JSX, HTML, Java, Python, SQL, Markdown…) e as linhas são somadas por colaborador e por tipo;
5. o percentual pode ser calculado sobre **linhas alteradas** (inseridas + deletadas, padrão), **inseridas** ou **deletadas**, sem nova consulta à API;
6. a opção **Ignorar arquivos gerados e dependências** (marcada por padrão) descarta `package-lock.json`, `yarn.lock`, `node_modules/`, `dist/`, `build/`, `*.min.js`, `*.map` etc., que não foram escritos pelo aluno e distorcem a análise.

Commits de merge nunca entram nesta aba (o diff do merge repete o que já foi contado). Acima de `FILE_TYPES_MAX_COMMITS` (3.000) só os commits mais recentes são lidos; se o limite da API acabar no meio, o resultado parcial é exibido. O botão **Exportar CSV** da aba gera um arquivo com uma linha por colaborador × tipo:

```text
Posição;Nome de Usuário;Tipo de Arquivo;Linhas Inseridas;Linhas Deletadas;Linhas Alteradas (Ins + Del);Arquivos;Percentual (%)
1;fulano;CSS;700;0;700;1;70,0
1;fulano;JavaScript;300;0;300;1;30,0
```

> ⚠️ **Squash merge:** quando uma branch é mergeada com *squash* e **não é apagada**, o trabalho aparece duas vezes (nos commits da branch e no commit "squash" da `main`). Apague as branches após o merge.

> ⚠️ **Limitação da API:** em repositórios com mais de 10.000 commits, o `/stats/contributors` (modo só a branch padrão) retorna `0` em inserções e deleções.

> ℹ️ Autores cujo e-mail do commit não está vinculado a uma conta do GitHub aparecem como `Nome <email>`, sem link de perfil. Datas com `~` são aproximadas.

## 🧩 Do Python para o React

| Python | React + Vite |
| --- | --- |
| `core/config.py` | `src/config/contributorStatsConfig.js` (o token vai para o `.env.local`) |
| `core/exceptions.py` | `src/core/exceptions.js` |
| `core/models.py` | `src/core/models.js` |
| `core/repo_url.py` | `src/core/repoUrl.js` |
| `core/ranking.py` | `src/core/ranking.js` |
| `core/exporter.py` | `src/core/exporter.js` (download pelo navegador) |
| `core/service.py` | `src/core/service.js` (`analyzeRepository`) |
| `core/github_client.py` | `src/services/githubClient.js` (navegador) + `api/_github.js` (servidor, com o token) |
| `threading.Event` / `ThreadPoolExecutor` | `AbortController` / `Promise.all` com até 8 tarefas |
| `gui/app.py` (Tkinter) | `src/components/ContributorStats/` |

## 📂 Estrutura do Projeto

```text
📁 ContributorStats
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
│   │   ├── PageLayout/                    └── Card da página com a faixa azul (logo PUC + logo da API)
│   │   └── ContributorStats/
│   │       ├── ContributorStats.jsx       └── Painel completo (formulário + abas)
│   │       ├── AnalysisForm.jsx           └── Repositório, critério e opções
│   │       ├── ContributorStatCards.jsx   └── Indicadores
│   │       ├── RankingTable.jsx           └── Tabela do ranking
│   │       ├── TopContributorsChart.jsx   └── Gráfico Top 10
│   │       ├── FileTypesPanel.jsx         └── Aba "Tipos de arquivo" (% de linhas por tipo)
│   │       ├── ExecutionLog.jsx           └── Log de execução
│   │       ├── useContributorStats.js     └── Hook: executa a análise, progresso e cancelamento
│   │       ├── format.js                  └── Formatação pt-BR
│   │       └── ContributorStats.css
│   │
│   ├── 🧠 core                            └── Regra de negócio (sem React)
│   │   ├── exceptions.js · models.js · repoUrl.js
│   │   ├── ranking.js · exporter.js · service.js
│   │   ├── fileTypes.js                   └── Classificação por extensão e agregação por tipo
│   │   └── index.js
│   │
│   ├── ⚙️ config/contributorStatsConfig.js
│   ├── 🛠️ services/githubClient.js        └── fetch para /api/github
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
- Nenhuma biblioteca para chamar a API nem para o gráfico: só `fetch` e CSS.

## 🧪 Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento (com a rota `/api/github`) |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Testa o build localmente (também atende `/api/github`) |
| `npm run lint` | Lint com o oxlint (padrão do template atual do Vite) |

## 📚 Documentação e Links Úteis

- 🔑 [Managing your personal access tokens](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens)
- 🧩 [REST API: Repository Statistics](https://docs.github.com/en/rest/metrics/statistics?apiVersion=2022-11-28)
- 🧬 [GraphQL API do GitHub](https://docs.github.com/en/graphql)
- ⚡ [Vite](https://vite.dev/) · ⚛️ [React](https://react.dev/)

## 📄 Licença
Este projeto está licenciado sob a MIT License.
