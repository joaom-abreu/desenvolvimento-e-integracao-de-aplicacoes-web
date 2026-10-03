# Projeto SecureLoginPUC (React + Vite) 🔐

## 📖 Descrição

Versão **somente front-end** do [SecureLoginPUC_3](https://github.com/joaopauloaramuni/desenvolvimento-e-integracao-de-aplicacoes-web/tree/main/PROJETOS/SpringBoot/SecureLoginPUC_3), feita com **React** e **Vite**. Não tem Spring Boot nem back-end: os usuários ficam salvos no `localStorage` do navegador e o e-mail de recuperação de senha é enviado pelo **EmailJS**.

Telas:

- **Login** com Google reCAPTCHA ("Não sou um robô")
- **Cadastro** (nome, e-mail, CPF com máscara, RG, endereço, instituição e senha)
- **Recuperar senha**, que envia um link por e-mail com o EmailJS
- **Redefinir senha**, aberta pelo link do e-mail (válido por 15 minutos)
- **Home**, protegida, só para quem está logado
- **Erro**, para link inválido/expirado ou página inexistente

## 🖼️ Capturas de Tela

| Login | Cadastro |
| :---: | :---: |
| ![Login](https://joaopauloaramuni.github.io/react-imgs/SecureLoginPUC_React/imgs/Login.png) | ![Cadastro](https://joaopauloaramuni.github.io/react-imgs/SecureLoginPUC_React/imgs/Register.png) |

| Recuperar senha | E-mail enviado pelo EmailJS |
| :---: | :---: |
| ![Recuperar senha](https://joaopauloaramuni.github.io/react-imgs/SecureLoginPUC_React/imgs/RecoverPassword.png) | ![E-mail](https://joaopauloaramuni.github.io/react-imgs/SecureLoginPUC_React/imgs/Email.png) |

| Redefinir senha | Home |
| :---: | :---: |
| ![Redefinir senha](https://joaopauloaramuni.github.io/react-imgs/SecureLoginPUC_React/imgs/ResetPassword.png) | ![Home](https://joaopauloaramuni.github.io/react-imgs/SecureLoginPUC_React/imgs/Home.png) |

## 🚀 Como rodar

```bash
npm install
cp .env.example .env.local   # opcional: EmailJS e reCAPTCHA
npm run dev
```

Acesse `http://localhost:5173`.

> Sem o `.env.local` o projeto abre normalmente: o reCAPTCHA usa a chave de teste do Google e, na recuperação de senha, o link aparece no **console** do navegador em vez de ser enviado por e-mail.

## 🧭 Rotas

| Rota | Tela |
| --- | --- |
| `/login` | Login com reCAPTCHA |
| `/register` | Cadastro |
| `/recoverpassword` | Recuperar senha (envia o e-mail) |
| `/resetpassword?token=...` | Redefinir senha (link do e-mail) |
| `/home` | Home (rota protegida) |
| `*` | Página de erro |

## 📂 Estrutura do Projeto

```text
📁 SecureLoginPUC_React
│
├── 📁 emailjs
│   └── template_recuperacao_senha.html
│       └── HTML do template de e-mail para colar no EmailJS
│
├── 📁 imgs
│   └── Capturas de tela usadas neste README
│
├── 📁 public
│   └── pucminas-logo.png
│       └── Favicon
│
├── 📁 src
│   │
│   ├── 📁 assets/images
│   │   └── pucminas-logo.png
│   │
│   ├── 🔐 auth
│   │   ├── authContext.js
│   │   │   └── Contexto de autenticação e hook useAuth()
│   │   │
│   │   └── AuthProvider.jsx
│   │       └── Guarda o usuário logado (login / logout) no sessionStorage
│   │
│   ├── 🧩 components
│   │   ├── AuthLayout.jsx / AuthLayout.css
│   │   │   └── Card com o painel azul da logo + formulário (layout de todas as telas)
│   │   │
│   │   ├── Message.jsx
│   │   │   └── Caixa de mensagem de sucesso / erro
│   │   │
│   │   └── ProtectedRoute.jsx
│   │       └── Redireciona para o login quem não estiver logado
│   │
│   ├── ⚙️ config
│   │   ├── emailJsConfig.js
│   │   │   └── IDs do EmailJS lidos do .env.local
│   │   │
│   │   └── recaptchaConfig.js
│   │       └── Site key do reCAPTCHA (ou a chave de teste do Google)
│   │
│   ├── 📄 pages
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── RecoverPassword.jsx
│   │   ├── ResetPassword.jsx
│   │   ├── Home.jsx / Home.css
│   │   └── ErrorPage.jsx
│   │
│   ├── 🛠️ services
│   │   ├── userService.js
│   │   │   └── Cadastro, login e troca de senha (localStorage)
│   │   │
│   │   ├── passwordRecoveryService.js
│   │   │   └── Gera, valida e invalida os tokens de recuperação (15 minutos)
│   │   │
│   │   └── sendEmailService.js
│   │       └── Envio do e-mail de recuperação com o EmailJS
│   │
│   ├── 🧰 utils
│   │   ├── hash.js      └── Hash SHA-256 da senha (Web Crypto API)
│   │   ├── masks.js     └── Máscara de CPF
│   │   └── storage.js   └── Leitura / escrita no localStorage com try/catch
│   │
│   ├── App.jsx
│   │   └── Rotas da aplicação (React Router)
│   │
│   ├── index.css
│   │   └── Reset, variáveis de cor e fundo da página
│   │
│   └── main.jsx
│
├── 📄 .env.example
├── 📄 vercel.json
│   └── Faz o Vercel abrir o index.html em qualquer rota (ex.: /resetpassword?token=...)
│
└── 📄 package.json
```

## ⚙️ Como funciona (sem back-end)

Como não há servidor, o navegador faz o papel do back-end do projeto Spring Boot:

| Spring Boot (SecureLoginPUC_3) | React + Vite (este projeto) |
| --- | --- |
| `UserService` | `services/userService.js` → `localStorage["puc-users"]` |
| `PasswordRecoveryService` | `services/passwordRecoveryService.js` → `localStorage["puc-recovery-tokens"]` |
| `SendEmailService` (JavaMailSender) | `services/sendEmailService.js` → EmailJS |
| Sessão do Spring Security | `auth/AuthProvider.jsx` → `sessionStorage["puc-session"]` |
| `RecaptchaFilter` / `RecaptchaService` | `react-google-recaptcha` (verificação só no front) |
| Templates Thymeleaf + CSS | Componentes React + CSS |

### Fluxo de recuperação de senha

1. Em **Recuperar senha**, o usuário informa o e-mail.
2. Se o e-mail existir, `generateToken()` cria um token com `crypto.randomUUID()` válido por **15 minutos**.
3. O EmailJS envia o e-mail com o link `http://localhost:5173/resetpassword?token=...`.
4. Em **Redefinir senha**, o token é conferido. Se for válido, a nova senha é salva e o token é apagado (uso único).
5. O usuário volta para o login com a mensagem "Senha redefinida com sucesso!".

### ⚠️ Limitações por ser só front-end

- Os dados ficam no `localStorage` de **um navegador**. O link do e-mail precisa ser aberto **no mesmo navegador** em que a recuperação foi pedida.
- As senhas são salvas como hash SHA-256 (nunca em texto puro), mas qualquer pessoa com acesso ao navegador pode ver ou apagar os dados no DevTools. Para um sistema real, use um back-end.
- O reCAPTCHA só impede o envio do formulário sem marcar a caixa: sem servidor, ninguém valida o token com a secret key.
- `crypto.subtle` e `crypto.randomUUID()` só funcionam em contexto seguro (`https` ou `localhost`). Se abrir pelo IP da rede (`npm run dev -- --host`), use `https`.

## 📬 Guia de configuração do EmailJS

### 1. Criar conta no EmailJS

Crie uma conta gratuita em [emailjs.com](https://www.emailjs.com/).

### 2. Criar um serviço de e-mail

Em **Email Services > Add New Service**, escolha o Gmail (ou outro provedor) e conecte sua conta. Anote o **Service ID**.

### 3. Criar o template de recuperação de senha

Em **Email Templates > Create New Template**:

1. Clique em **Edit Content > Code Editor** e cole o HTML de [`emailjs/template_recuperacao_senha.html`](emailjs/template_recuperacao_senha.html).
2. Preencha os campos do template:

| Campo | Valor |
| --- | --- |
| Subject | `{{title}}` |
| To Email | `{{email}}` |
| From Name | `PUC Minas` |

3. Salve e anote o **Template ID**.

#### Variáveis enviadas pelo React

```js
emailjs.send(SERVICE_ID, TEMPLATE_ID_RECOVERY, {
  name: "Joao",                      // {{name}}
  email: "usuario@email.com",        // {{email}}  (destinatário)
  link: "http://localhost:5173/resetpassword?token=...", // {{link}}
  validity: "15 minutos",            // {{validity}}
  title: "Recuperação de Senha - PUC Minas", // {{title}}
}, { publicKey: PUBLIC_KEY });
```

### 4. Pegar a Public Key e configurar o `.env.local`

A **Public Key** fica em **Account > General**. Depois:

```bash
cp .env.example .env.local
```

```properties
VITE_EMAILJS_SERVICE_ID=service_xxxxxxx
VITE_EMAILJS_TEMPLATE_ID_RECOVERY=template_xxxxxxx
VITE_EMAILJS_PUBLIC_KEY=xxxxxxxxxxxxxxx
```

Reinicie o `npm run dev` depois de alterar o `.env.local`.

### 5. `emailJsConfig.js`

```js
// https://dashboard.emailjs.com/admin
const EMAILJS_CONFIG = {
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  TEMPLATE_ID_RECOVERY: import.meta.env.VITE_EMAILJS_TEMPLATE_ID_RECOVERY,
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,
};

export default EMAILJS_CONFIG;
```

## 🤖 Guia de configuração do Google reCAPTCHA

Sem configurar nada, o projeto usa a **chave de teste oficial do Google**: o widget funciona, mas mostra o aviso "somente para testes".

Para usar a sua chave:

1. Acesse o [console do reCAPTCHA](https://www.google.com/recaptcha/admin) e crie um site do tipo **reCAPTCHA v2 > Caixa de seleção "Não sou um robô"**.
2. Em **Domínios**, adicione `localhost` (e o domínio do Vercel, se for publicar).
3. Copie a **Site key** para o `.env.local`:

```properties
VITE_RECAPTCHA_SITE_KEY=6Lxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

> A **Secret key** não é usada aqui: ela só serve para validar o token em um back-end e nunca deve ir para o código do front.

## ☁️ Deploy no Vercel

1. Importe o repositório no Vercel (o preset **Vite** é detectado sozinho).
2. Em **Settings > Environment Variables**, cadastre as mesmas variáveis do `.env.local`.
3. O `vercel.json` já redireciona todas as rotas para o `index.html`, então o link `/resetpassword?token=...` funciona em produção.

## 📦 Dependências

```json
"dependencies": {
  "@emailjs/browser": "^4.4.1",
  "react": "^19.2.8",
  "react-dom": "^19.2.8",
  "react-google-recaptcha": "^3.1.0",
  "react-router-dom": "^7.18.4"
}
```

- [`@emailjs/browser`](https://www.npmjs.com/package/@emailjs/browser): SDK oficial do EmailJS (substitui o antigo `emailjs-com`)
- [`react-google-recaptcha`](https://www.npmjs.com/package/react-google-recaptcha): componente do Google reCAPTCHA v2
- [`react-router-dom`](https://reactrouter.com/): rotas da aplicação

## 🧪 Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Testa o build localmente |
| `npm run lint` | Lint com o oxlint (padrão do template atual do Vite) |

## 📄 Licença
Este projeto está licenciado sob a MIT License.
