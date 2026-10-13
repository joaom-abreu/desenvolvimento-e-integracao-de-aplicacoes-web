# Projeto AraUrlShortener (React + Vite + Supabase) 🔗

## 📖 Descrição

O **AraUrlShortener** é a versão em **React** e **Vite** do projeto [Url_Shortener_v2 (Spring Boot)](https://github.com/joaopauloaramuni/desenvolvimento-e-integracao-de-aplicacoes-web/tree/main/PROJETOS/SpringBoot/Url_Shortener_v2). É o **AraUrl**, um encurtador de URL de uso pessoal para substituir o `tinyurl.com`: você cola uma URL longa e recebe um link como `https://araurl.vercel.app/Ab3xYz`.

Os links ficam **persistidos no PostgreSQL do [Supabase](https://supabase.com/)**, na tabela `urls`. A diferença está no caminho até o banco: no Spring, o servidor conectava via **JDBC** (Spring Data JPA) e respondia o redirecionamento com um `302`; aqui **não existe servidor**. O navegador fala com o Supabase pelo SDK **`@supabase/supabase-js`**, que usa a **Data API** (HTTPS) com a chave **publicável**, protegida por **RLS** e por **funções SQL**. O site é estático e fica hospedado na **[Vercel](https://vercel.com/)**.

## ✨ Funcionalidades

- **Encurtar URL**: cole a URL longa e clique em **Encurtar**. O código aleatório tem **6 caracteres** (`A-Z`, `a-z`, `0-9`), o mesmo do `generateRandomString` do Spring.
- **Alias personalizado**: escolha o código (`araurl.vercel.app/curriculo`). Letras, números, `-` e `_`, de 3 a 32 caracteres. Se já existir, aparece um aviso.
- **Data de expiração** (opcional): o mesmo `expirationDate` do Spring. Depois da data, o link mostra a tela **Link expirado** (o antigo `410`).
- **Contador de cliques**: cada redirecionamento soma **+1** no banco, numa única operação atômica.
- **Histórico "Seus links"**: lista os links criados **neste navegador**, com cliques, data de criação, expiração, **copiar**, **abrir** e **excluir** (com confirmação).
- **Redirecionamento**: `araurl.vercel.app/{código}` busca a URL original e redireciona com `window.location.replace` (o link curto não fica no botão "voltar").
- **Tema light e dark**: segue o tema do sistema e tem um botão (☀️/🌙) que salva a escolha. O tema é aplicado antes do React carregar, então a página não "pisca".
- **Validações**: completa `https://` quando falta, recusa `javascript:` e outros esquemas, recusa links do próprio AraUrl (link curto para link curto) e datas de expiração no passado. O banco confere tudo de novo.
- **Responsivo**: funciona bem no celular.

## 🖼️ Capturas de Tela

| Home | Home - Tema escuro |
| :---: | :---: |
| ![Home](https://joaopauloaramuni.github.io/react-imgs/AraUrlShortener/imgs/Home.png) | ![HomeDark](https://joaopauloaramuni.github.io/react-imgs/AraUrlShortener/imgs/HomeDark.png) |

| Link criado | Link criado - Tema escuro |
| :---: | :---: |
| ![LinkCriado](https://joaopauloaramuni.github.io/react-imgs/AraUrlShortener/imgs/LinkCriado.png) | ![LinkCriadoDark](https://joaopauloaramuni.github.io/react-imgs/AraUrlShortener/imgs/LinkCriadoDark.png) |

| Link expirado (410) | Link não encontrado (404) |
| :---: | :---: |
| ![LinkExpirado](https://joaopauloaramuni.github.io/react-imgs/AraUrlShortener/imgs/LinkExpirado.png) | ![LinkNaoEncontrado](https://joaopauloaramuni.github.io/react-imgs/AraUrlShortener/imgs/LinkNaoEncontrado.png) |

| Celular | Celular - Tema escuro |
| :---: | :---: |
| ![Mobile](https://joaopauloaramuni.github.io/react-imgs/AraUrlShortener/imgs/Mobile.png) | ![MobileDark](https://joaopauloaramuni.github.io/react-imgs/AraUrlShortener/imgs/MobileDark.png) |

## 🚀 Como rodar

```bash
npm install
cp .env.example .env.local   # preencha com os dados do seu projeto Supabase
npm run dev
```

Acesse `http://localhost:5173`. Antes de encurtar, crie a tabela no Supabase (passo 2 abaixo).

## 🗄️ Configuração do Supabase (passo a passo)

### 1. Criar a conta e o projeto

1. Acesse [supabase.com](https://supabase.com/) e crie uma conta (dá para entrar com o GitHub).
2. No dashboard, clique em **New project**.
3. Preencha:
   - **Name**: por exemplo, `araurl`.
   - **Database Password**: crie uma senha e guarde-a. Neste projeto ela **não** vai para o `.env` (o React não conecta com usuário e senha do banco).
   - **Region**: escolha a mais próxima. No Brasil, **South America (São Paulo)** (`sa-east-1`). ⚠️ A região não pode ser alterada depois.
4. Clique em **Create new project** e aguarde o banco ficar pronto.

### 2. Criar a tabela, o RLS e as funções (obrigatório)

No Spring, o Flyway criava a tabela (`V1__create-table-urls.sql`). Aqui não existe servidor, então abra o **SQL Editor** no Supabase, cole o conteúdo de **`supabase_urls.sql`** e clique em **Run**. O script pode ser executado de novo sem problema.

Ele cria:

| Objeto | O que faz |
|---|---|
| Tabela `urls` | `short_url`, `original_url`, `expiration_date`, `clicks`, `owner_token`, `created_at` |
| `check` no `short_url` | Só `A-Z`, `a-z`, `0-9`, `-` e `_`, de 3 a 32 caracteres |
| `check` no `original_url` | Só `http://` ou `https://` (o `@Pattern` do `UrlRequestDTO`), até 4096 caracteres |
| RLS + `grant insert (4 colunas)` | O visitante só **insere**, e não consegue escolher `clicks` nem `created_at` |
| Policy `urls_insert` | Recusa `expiration_date` no passado |
| Função `resolve_url` | Redirecionamento: devolve a URL e soma +1 clique, ou avisa que expirou |
| Função `list_my_urls` | Histórico: links do `owner_token` deste navegador |
| Função `delete_my_url` | Exclui, mas só se o `owner_token` for o de quem criou |

### 3. Pegar a URL e a chave publicável

1. **Project Settings → Data API**: copie a **Project URL** (`https://<project-ref>.supabase.co`).
2. **Project Settings → API Keys**: copie a **Publishable key** (`sb_publishable_...`).

Os dois também aparecem no botão **Connect**, na barra superior do projeto. A chave **`anon`** (legacy) funciona do mesmo jeito.

> ⛔ **Nunca use a `secret key` (`sb_secret_...`) nem a `service_role`** neste projeto. Elas **ignoram o RLS** e dão acesso total ao banco, e tudo que começa com `VITE_` vai para o JavaScript do navegador, onde qualquer visitante consegue ler.

### 4. Configurar o `.env.local`

O `.env.local` fica **só na sua máquina** (está no `.gitignore`).

```bash
cp .env.example .env.local
```

```properties
# ---------- Supabase ----------
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxxxxxxxxxxxxxxxxxx

# ---------- AraUrl (opcional) ----------
# VITE_SHORT_URL_BASE=https://araurl.vercel.app
```

| Variável | Para que serve | Equivalente no Spring |
|---|---|---|
| `VITE_SUPABASE_URL` | Endereço da Data API do seu projeto | `spring.datasource.url` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Chave pública usada pelo `supabase-js` (também aceita `VITE_SUPABASE_ANON_KEY`) | `spring.datasource.username` / `password` |
| `VITE_SHORT_URL_BASE` | Endereço dos links curtos (opcional). Vazio = o endereço em que o site está aberto | `http://localhost:8080/api` |

Reinicie o `npm run dev` depois de alterar: o Vite só lê o `.env.local` quando inicia.

### 5. Rodar e verificar

1. Acesse `http://localhost:5173`, cole uma URL e clique em **Encurtar**.
2. No Supabase, abra o **Table Editor** e selecione a tabela `urls`: o link deve aparecer lá.
3. Abra o link curto (`http://localhost:5173/Ab3xYz`): ele redireciona e a coluna `clicks` passa para `1`.

> 💤 No plano gratuito, projetos sem atividade por cerca de uma semana são **pausados**. Se os links pararem de abrir, entre no dashboard e clique em **Restore project**. Usar o encurtador com frequência evita a pausa.

## 🔐 Segurança: por que a chave pode ficar no navegador?

A **publishable key** foi feita para ser pública. Ela só identifica o projeto; o que cada visitante pode fazer é decidido pelo **banco**. Como ela fica no navegador, qualquer pessoa pode chamar a Data API com o papel `anon`. Por isso o `supabase_urls.sql` fecha tudo e libera só o necessário:

| O visitante tenta... | Resultado | Por quê |
|---|---|---|
| Listar todos os links (`select * from urls`) | ❌ `permission denied` | Não existe `grant select` para o `anon` |
| Alterar cliques ou URLs (`update`) | ❌ `permission denied` | Não existe `grant update` |
| Apagar links dos outros (`delete`) | ❌ `permission denied` | Só pela função `delete_my_url`, que confere o `owner_token` |
| Criar um link com `clicks = 999` | ❌ `permission denied` | O `grant insert` é só em 4 colunas |
| Criar um link para `javascript:alert(1)` | ❌ `check constraint` | Só `http://` e `https://` |
| Criar um link já expirado | ❌ `row-level security policy` | Policy `urls_insert` |
| Abrir um link curto | ✅ | Função `resolve_url` (um código por vez) |
| Ver o próprio histórico | ✅ | Função `list_my_urls` com o seu `owner_token` |

### O `owner_token`

Não há login. Na primeira visita, o navegador gera um **UUID aleatório** (`crypto.randomUUID()`) e guarda no `localStorage` (`araurl:owner-token`). Ele vai junto em cada link criado e é a "chave" do histórico e da exclusão.

- Outro navegador (ou outro celular) tem **outro** `owner_token`, então mostra outro histórico.
- Se você limpar os dados do site, o histórico some da tela, mas **os links continuam funcionando**.

### ⚠️ Qualquer visitante pode encurtar

Esta versão deixa **qualquer pessoa** que abrir o site criar links. Para uso pessoal isso costuma bastar, mas quem descobrir o endereço pode criar links no seu domínio. Se isso virar problema, os próximos passos naturais são:

1. **Supabase Auth** (e-mail + senha, com cadastro desligado): a policy de `insert` passa a ser `to authenticated`, e só você logado encurta. Abrir os links continua público.
2. **Captcha** no formulário (veja o projeto [Captcha_React](https://github.com/joaopauloaramuni/desenvolvimento-e-integracao-de-aplicacoes-web/tree/main/PROJETOS/React/Captcha_React), com Cloudflare Turnstile).

## 🔁 O que mudou em relação ao Spring Boot

| Spring Boot (JPA + PostgreSQL) | React + Vite + Supabase |
|---|---|
| `application.properties` (JDBC, usuário, senha) | `.env.local` (URL + chave publicável) e `src/config/supabaseClient.js` |
| JDBC direto no Postgres (porta 5432) | **Data API** do Supabase (HTTPS) pelo `supabase-js` |
| `V1__create-table-urls.sql` (Flyway) | `supabase_urls.sql` (rode no SQL Editor) |
| `model/Url.java` (`@Entity`) | `src/model/Url.js` (mesmos campos + `clicks`) |
| `repository/UrlRepository.java` (`JpaRepository`) | `src/repository/urlRepository.js` (`save`, `resolve`, `findAllByOwnerToken`, `deleteByShortUrlAndOwnerToken`) |
| `service/UrlService.java` | `src/services/urlService.js` (mesmas funções: `generateShortUrl`, `getAndValidateOriginalUrl`, `generateRandomString`) |
| `SecureRandom` | `crypto.getRandomValues` (sem viés do módulo) |
| `do/while` com `findByShortUrl` antes de salvar | Tenta inserir; se o `unique` recusar, sorteia outro (até 5 vezes). Sem janela entre consultar e salvar |
| `dto/UrlRequestDTO.java` (`@NotBlank`, `@Pattern`) | `normalizeUrl`, `normalizeAlias` e `normalizeExpirationDate` + `check` no banco |
| `exception/UrlNotFoundException` e `UrlExpiredException` | `src/core/exceptions.js` (mesmos nomes) |
| `GlobalExceptionHandler` (404 / 410) | Componente `LinkError` (telas "Link não encontrado" e "Link expirado") |
| `POST /api/shorten` | Home (`/`): formulário `ShortenForm` |
| `GET /api/{shortUrl}` → `302 Location` | Rota `/:shortUrl` → `resolve_url` → `window.location.replace` |
| `varchar(255)` no `original_url` | `text` com até 4096 caracteres (URLs grandes de verdade) |
| Login com JWT (`/auth/register`, `/auth/login`) | Sem login: `owner_token` anônimo por navegador (veja **Segurança**) |
| Swagger em `/swagger-ui` | Não se aplica: a API é a Data API do Supabase |
| Docker + `docker-compose` | Não se aplica: site estático na Vercel + banco no Supabase |
| Sem contador de cliques, alias nem histórico | **Novo:** cliques, alias personalizado, histórico e tema light/dark |

## ⚙️ Como funciona

```text
                       ┌─ insert ──────────▶ /rest/v1/urls                 (só 4 colunas, RLS)
Navegador (React) ─────┤
  supabase-js +        ├─ rpc ─────────────▶ /rest/v1/rpc/resolve_url      (redireciona + clique)
  chave publicável     ├─ rpc ─────────────▶ /rest/v1/rpc/list_my_urls     (histórico)
                       └─ rpc ─────────────▶ /rest/v1/rpc/delete_my_url    (excluir)
                                             <project-ref>.supabase.co
```

**Encurtar**

1. O `ShortenForm` chama `generateShortUrl(url, { alias, expirationDate })`.
2. O service valida e normaliza a URL (completa `https://`, recusa outros esquemas).
3. Sem alias, sorteia 6 caracteres e faz o `insert`. Se o código já existir (erro `23505` do Postgres), sorteia outro.
4. O link aparece no cartão **Link criado** e no topo de **Seus links**, sem recarregar a lista.

**Redirecionar**

1. A Vercel recebe `araurl.vercel.app/Ab3xYz`. Não existe esse arquivo, então o `vercel.json` entrega o `index.html`.
2. O React Router cai na rota `/:shortUrl` e a página `Redirect` chama `resolve_url('Ab3xYz')`.
3. A função faz um único `UPDATE ... SET clicks = clicks + 1 ... RETURNING original_url`. Se não voltar linha, confere se o link existe mas expirou.
4. O React faz `window.location.replace(original_url)` ou mostra a tela de erro (404 / 410).

> 💡 **StrictMode e cliques:** no `npm run dev`, o React roda cada efeito duas vezes. A página `Redirect` guarda a Promise de cada código num `Map`, então a segunda execução reaproveita a primeira e a visita conta **um** clique só.

## 🧭 Rotas

| Rota | Página | Equivalente no Spring |
|---|---|---|
| `/` | Home: encurtar + histórico | `POST /api/shorten` |
| `/:shortUrl` | Redireciona para a URL original | `GET /api/{shortUrl}` |
| `*` (ex.: `/a/b/c`) | Link não encontrado | `404` |

## 🛠️ Service e repository

### `urlService.js`

- `generateShortUrl(url, { alias, expirationDate })`: valida, gera o código (ou usa o alias) e salva. Lança `AliasAlreadyExistsException` se o alias estiver em uso.
- `getAndValidateOriginalUrl(shortUrl)`: devolve a URL original e conta o clique. Lança `UrlNotFoundException` ou `UrlExpiredException`.
- `generateRandomString(length)`: string aleatória com letras maiúsculas, minúsculas e dígitos, com `crypto.getRandomValues`. Bytes `>= 248` são descartados para todos os 62 caracteres terem a mesma chance.
- `normalizeUrl(url)`, `normalizeAlias(alias)`, `normalizeExpirationDate(valor)`: as validações do antigo `UrlRequestDTO`.
- `listMyUrls()` e `deleteMyUrl(shortUrl)`: histórico e exclusão, sempre com o `owner_token` deste navegador.
- `buildShortLink(shortUrl)`: monta `https://araurl.vercel.app/Ab3xYz`.

### `urlRepository.js`

```js
// insert into urls (short_url, original_url, expiration_date, owner_token) values (...)
// Sem .select(): o anon não tem SELECT, então o insert vai sem RETURNING.
await supabase.from("urls").insert({ short_url, original_url, expiration_date, owner_token });

// select * from resolve_url('Ab3xYz')  -> 0 ou 1 linha
await supabase.rpc("resolve_url", { p_short_url: "Ab3xYz" }).maybeSingle();

// select * from list_my_urls('<uuid>')
await supabase.rpc("list_my_urls", { p_owner_token: ownerToken });

// select delete_my_url('Ab3xYz', '<uuid>')  -> true / false
await supabase.rpc("delete_my_url", { p_short_url: "Ab3xYz", p_owner_token: ownerToken });
```

### Tabela `urls`

| Coluna | Tipo | Descrição |
|---|---|---|
| `id` | `bigint` (identity) | Chave primária |
| `short_url` | `text` (unique) | Código curto: aleatório (6 caracteres) ou alias (3 a 32) |
| `original_url` | `text` | A URL longa (`http://` ou `https://`, até 4096 caracteres) |
| `expiration_date` | `timestamptz` | Data de expiração (opcional, `null` = nunca expira) |
| `clicks` | `bigint` | Número de redirecionamentos (`default 0`) |
| `owner_token` | `uuid` | Navegador que criou o link (histórico e exclusão) |
| `created_at` | `timestamptz` | Data de criação (`default now()`) |

## 📂 Estrutura do Projeto

```text
📁 AraUrlShortener
│
├── 📁 imgs                              └── Capturas de tela usadas neste README
├── 📁 public
│   └── favicon.svg                      └── Logo Aramuni (azul, com variante para tema escuro)
│
├── 📁 src
│   ├── 📁 assets/images
│   │   └── aramuni-logo.svg             └── Logo da faixa azul (pintada com a cor do texto via mask)
│   │
│   ├── ⚙️ config
│   │   ├── appConfig.js                 └── Alfabeto, tamanho do código, regras do alias, chaves do localStorage
│   │   └── supabaseClient.js            └── createClient com a URL e a chave publicável
│   │
│   ├── 🧱 core
│   │   └── exceptions.js                └── UrlNotFoundException, UrlExpiredException, ...
│   │
│   ├── 🧩 model
│   │   └── Url.js                       └── Um link curto (o Url.java), com fromRow() e expired
│   │
│   ├── 🗄️ repository
│   │   └── urlRepository.js             └── insert na tabela + chamadas rpc() das funções
│   │
│   ├── 🔎 services
│   │   └── urlService.js                └── Regras do encurtador (o UrlService.java)
│   │
│   ├── 🪝 hooks
│   │   ├── useMyUrls.js                 └── Histórico: carregar, adicionar, atualizar e excluir
│   │   └── useTheme.js                  └── Tema light/dark (sistema + escolha salva)
│   │
│   ├── 🧰 utils
│   │   ├── clipboard.js                 └── Copiar (com plano B fora do HTTPS)
│   │   ├── format.js                    └── Datas e números em pt-BR
│   │   └── storage.js                   └── localStorage com try/catch (owner_token e tema)
│   │
│   ├── 🎨 components
│   │   ├── PageLayout/                  └── Card com a faixa azul (logo Aramuni + AraUrl), título e rodapé
│   │   ├── ThemeToggle/                 └── Botão ☀️/🌙
│   │   ├── ShortenForm/                 └── Caixa da URL longa + alias + expiração
│   │   ├── ShortUrlResult/              └── Cartão "Link criado" (copiar / abrir)
│   │   ├── UrlHistory/                  └── "Seus links" (UrlHistory + UrlHistoryItem)
│   │   ├── CopyButton/                  └── Botão copiar com "Copiado!"
│   │   └── LinkError/                   └── Telas 404 e 410
│   │
│   ├── 📄 pages
│   │   ├── Home.jsx                     └── "/": encurtar + histórico
│   │   ├── Redirect.jsx                 └── "/:shortUrl": busca e redireciona
│   │   └── NotFound.jsx                 └── "*": link não encontrado
│   │
│   ├── App.jsx                          └── Rotas (React Router)
│   ├── index.css                        └── Tokens de cor (light e dark), reset, botões e mensagens
│   └── main.jsx
│
├── 🗃️ supabase_urls.sql                 └── Tabela + RLS + funções (rode no SQL Editor)
├── 📄 vercel.json                       └── Qualquer caminho -> index.html (rotas do React)
├── 📄 .env.example                      └── Modelo do .env.local
├── 📄 index.html                        └── Fonte Montserrat + script do tema (sem "piscar")
├── 📄 vite.config.js
└── 📄 package.json
```

## ☁️ Deploy na Vercel

1. Suba o projeto para um repositório no GitHub.
2. Em [vercel.com/new](https://vercel.com/new), clique em **Import** no repositório (preset **Vite**).
3. Em **Project Name**, use **`araurl`**. É o nome do projeto que vira o endereço: `https://araurl.vercel.app` (se o nome estiver livre; senão a Vercel sugere outro, como `araurl-xyz`).
4. Abra **Environment Variables** e cadastre:

   | Key | Value |
   | --- | --- |
   | `VITE_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
   | `VITE_SUPABASE_PUBLISHABLE_KEY` | `sb_publishable_...` |

5. Clique em **Deploy**.

> As variáveis `VITE_*` entram no JavaScript **na hora do build**: se trocar alguma, faça um **Redeploy**.

> 🌐 **Quer um domínio ainda mais curto?** Em **Settings → Domains** dá para ligar um domínio próprio (ex.: `ara.url.br`). Nesse caso, cadastre também `VITE_SHORT_URL_BASE=https://ara.url.br` para os links já saírem com o domínio novo.

O `vercel.json` é o que faz os links curtos funcionarem: a Vercel entrega primeiro os arquivos que existem (`/assets/...`, `/favicon.svg`) e manda **qualquer outro caminho** (`/Ab3xYz`) para o `index.html`, onde o React Router decide.

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

## 🚧 Limitações de um encurtador sem back-end

| Limitação | Por quê | Como resolveria |
|---|---|---|
| O redirecionamento precisa de JavaScript | Não há servidor para responder `302`; quem redireciona é o React | Uma **Vercel Function** ou **Edge Middleware** consultando o Supabase |
| Prévia do link (WhatsApp, Slack, LinkedIn) mostra o AraUrl, e não o site de destino | Os robôs de prévia não executam JavaScript, então leem o `index.html` | Idem: redirecionar no servidor |
| Um pequeno atraso no redirecionamento | O navegador baixa o app e depois consulta o Supabase | Idem; ou um projeto Supabase em `sa-east-1` (São Paulo) |
| Qualquer visitante pode encurtar | Escolha deste projeto (uso pessoal, sem login) | Supabase Auth ou captcha (veja **Segurança**) |
| O histórico é por navegador | O `owner_token` fica no `localStorage` | Supabase Auth: o histórico passa a ser por usuário |

## 🧯 Problemas comuns

| Sintoma / erro | Causa provável | Solução |
|---|---|---|
| Aviso "Supabase não configurado" | `.env.local` ausente ou servidor não reiniciado | Criar o `.env.local` (passo 4) e reiniciar o `npm run dev` |
| `Invalid API key` | Chave copiada errada ou de outro projeto | Copiar de novo em **Project Settings → API Keys** |
| `relation "public.urls" does not exist` | Tabela não criada | Rodar o `supabase_urls.sql` (passo 2) |
| `Could not find the function public.resolve_url` | Funções não criadas ou cache da Data API desatualizado | Rodar o `supabase_urls.sql` inteiro (ele termina com `notify pgrst, 'reload schema'`) |
| `permission denied for table urls` ao encurtar | Faltou o `grant insert` | Rodar o `supabase_urls.sql` inteiro |
| `new row violates row-level security policy` | Data de expiração no passado, ou faltou a policy | Escolher uma data futura / rodar o script inteiro |
| `Failed to fetch` | Projeto pausado (plano free) ou URL errada | **Restore project** no dashboard / conferir `VITE_SUPABASE_URL` |
| `404` da Vercel ao abrir um link curto | Faltou o `vercel.json` | Conferir se o `vercel.json` está na raiz do repositório |
| Link curto sai como `localhost:5173/...` | Link criado no `npm run dev` | Normal: o endereço é o do site aberto. Na Vercel sai `araurl.vercel.app/...` |
| Histórico vazio em outro navegador | O histórico é por navegador (`owner_token`) | Os links continuam funcionando; veja **Segurança** |

> 💡 No console aparece `409 (Conflict)` quando você tenta um alias que já existe. É o navegador registrando a resposta do banco: o app trata o erro e mostra o aviso.

## 📦 Dependências

```json
"dependencies": {
  "@supabase/supabase-js": "^2.117.3",
  "react": "^19.3.0",
  "react-dom": "^19.3.0",
  "react-icons": "^5.7.0",
  "react-router-dom": "^7.18.4"
}
```

- [`@supabase/supabase-js`](https://supabase.com/docs/reference/javascript/introduction): cliente oficial do Supabase. Faz o papel do `spring-boot-starter-data-jpa` + driver `postgresql`: monta as requisições para a Data API a partir de `from(...).insert()` e `rpc(...)`.
- [`react-router-dom`](https://reactrouter.com/): rotas `/` e `/:shortUrl` (o `@GetMapping("/{shortUrl}")`).
- [`react-icons`](https://react-icons.github.io/react-icons/): ícones do [Lucide](https://lucide.dev/) (`react-icons/lu`).

## 🧪 Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Testa o build localmente |
| `npm run lint` | Lint com o oxlint (padrão do template atual do Vite) |

## 🔗 Urls do projeto

http://localhost:5173/

http://localhost:5173/Ab3xYz

https://araurl.vercel.app/

## 📚 Documentação e Links Úteis

**Projeto original**

- [Url_Shortener_v2 (Spring Boot)](https://github.com/joaopauloaramuni/desenvolvimento-e-integracao-de-aplicacoes-web/tree/main/PROJETOS/SpringBoot/Url_Shortener_v2)

**Supabase**

- [Supabase: Dashboard](https://supabase.com/dashboard)
- [supabase-js: Referência](https://supabase.com/docs/reference/javascript/introduction)
- [supabase-js: rpc()](https://supabase.com/docs/reference/javascript/rpc)
- [Supabase: Usando com React](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)
- [Supabase: API Keys (publishable e secret)](https://supabase.com/docs/guides/api/api-keys)
- [Supabase: Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase: Database Functions](https://supabase.com/docs/guides/database/functions)

**React, Vite e Vercel**

- [Documentação do React](https://react.dev/)
- [Documentação do Vite](https://vite.dev/)
- [Variáveis de ambiente no Vite](https://vite.dev/guide/env-and-mode)
- [React Router](https://reactrouter.com/)
- [Vite na Vercel](https://vercel.com/docs/frameworks/frontend/vite)
- [vercel.json: rewrites](https://vercel.com/docs/project-configuration/vercel-json#rewrites)
- [Vercel: domínios próprios](https://vercel.com/docs/domains/working-with-domains/add-a-domain)

## 📄 Licença
Este projeto está licenciado sob a MIT License.
