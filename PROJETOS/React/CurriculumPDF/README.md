# Projeto CurriculumPDF (React + Vite) 📄

## 📖 Descrição

Visualizador de **currículo em PDF** feito com **React**, **Vite** e [**react-pdf**](https://github.com/wojtekmaj/react-pdf) (PDF.js). O PDF aparece **dentro da página**, do mesmo jeito em qualquer navegador, com o texto selecionável e os links clicáveis.

Este projeto **não usa API externa nem chave**: não precisa de `.env.local` nem de variável na Vercel.

Recursos:

- Troca de **idioma** (Português / English), cada um com o seu PDF
- **Zoom** (50% a 200%) e **ajustar à largura**
- **Baixar PDF** (com nome de arquivo personalizado) e **Abrir** em outra aba
- Contagem de **páginas**, estados de **carregando** e **erro**
- A página se ajusta à largura da tela (celular incluído)
- O react-pdf (~600 kB) só é baixado quando o visualizador aparece (`React.lazy`)

## 🖼️ Capturas de Tela

| Português | English |
| :---: | :---: |
| ![Home](https://joaopauloaramuni.github.io/react-imgs/CurriculumPDF/imgs/Home.png) | ![English](https://joaopauloaramuni.github.io/react-imgs/CurriculumPDF/imgs/English.png) |

| Zoom 150% | Celular |
| :---: | :---: |
| ![Zoom](https://joaopauloaramuni.github.io/react-imgs/CurriculumPDF/imgs/Zoom.png) | ![Mobile](https://joaopauloaramuni.github.io/react-imgs/CurriculumPDF/imgs/Mobile.png) |

## 🚀 Como rodar

```bash
npm install
npm run dev
```

Acesse `http://localhost:5173`.

## ✏️ Colocando o SEU currículo

1. Exporte o seu currículo em PDF (Word, Google Docs, Canva, LaTeX...).
2. Coloque os arquivos na pasta `public/`, por exemplo `public/curriculo-pt.pdf` e `public/curriculo-en.pdf`.
   > Tudo que está em `public/` é servido na raiz do site: `public/curriculo-pt.pdf` vira `/curriculo-pt.pdf`.
3. Ajuste `src/config/curriculumConfig.js`:

```js
FILES: [
  { id: "pt", label: "Português", file: "/curriculo-pt.pdf", downloadName: "Curriculo-Seu-Nome.pdf" },
  { id: "en", label: "English",   file: "/curriculo-en.pdf", downloadName: "Resume-Your-Name.pdf" },
],
```

Tem currículo em um idioma só? Deixe só um item em `FILES`: os botões de idioma somem sozinhos.

> Os PDFs que vêm no projeto são de uma aluna **fictícia** (Ana Clara Ribeiro), só para exemplo.

## ⚙️ Como funciona

- `<Document file="/curriculo-pt.pdf">` baixa e lê o PDF; `<Page pageNumber={n} width={...}>` desenha cada página num `<canvas>`, com uma camada de texto (selecionável) e uma de links por cima.
- O **PDF.js** lê o arquivo num **worker** (outra thread) para não travar a página. O worker sai do próprio build:

  ```js
  import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  ```

  Pelo README do react-pdf, isso precisa ficar **no mesmo arquivo** que usa `<Document>`.
- A largura da página vem de um `ResizeObserver` na área do PDF: com zoom 100% a página ocupa a largura disponível, e acompanha a janela.
- O `App.jsx` carrega o visualizador com `React.lazy`: o resto do site abre rápido e o PDF.js chega depois.

## 🧩 Usando no seu projeto

```bash
npm install react-pdf
```

Copie `src/components/CurriculumViewer/`, `src/config/curriculumConfig.js` e os seus PDFs em `public/`:

```jsx
import CurriculumViewer from "./components/CurriculumViewer/CurriculumViewer";

<CurriculumViewer />   {/* usa os FILES do curriculumConfig.js */}

<CurriculumViewer
  files={[{ id: "pt", label: "PT", file: "/meu-cv.pdf", downloadName: "Meu-CV.pdf" }]}
/>
```

## ☁️ Deploy na Vercel

Importe o repositório em [vercel.com/new](https://vercel.com/new) (preset **Vite**) e clique em **Deploy**. Não há variáveis de ambiente para configurar: os PDFs vão junto, a partir da pasta `public/`.

## 📂 Estrutura do Projeto

```text
📁 CurriculumPDF
│
├── 📁 imgs              └── Capturas de tela usadas neste README
│
├── 📁 public
│   ├── curriculo-pt.pdf └── Currículo de exemplo (troque pelo seu)
│   ├── curriculo-en.pdf └── Resume de exemplo (troque pelo seu)
│   └── pucminas-logo.png
│
├── 📁 src
│   ├── 📁 assets/images └── pucminas-logo.png
│   │
│   ├── 🧩 components
│   │   ├── PageLayout/                └── Card da página com a faixa azul (logo PUC + ícone de PDF)
│   │   └── CurriculumViewer/
│   │       ├── CurriculumViewer.jsx   └── react-pdf: idioma, zoom, baixar, abrir
│   │       └── CurriculumViewer.css
│   │
│   ├── ⚙️ config
│   │   └── curriculumConfig.js        └── Arquivos PDF e limites do zoom
│   │
│   ├── App.jsx                        └── Carrega o visualizador com React.lazy
│   ├── index.css
│   └── main.jsx
│
├── 📄 vite.config.js    └── Silencia o aviso 'use client' do react-pdf no build
└── 📄 package.json
```

## 📦 Dependências

```json
"dependencies": {
  "react": "^19.2.8",
  "react-dom": "^19.2.8",
  "react-icons": "^5.7.0",
  "react-pdf": "^10.5.0"
}
```

- [`react-pdf`](https://www.npmjs.com/package/react-pdf): componentes React em cima do PDF.js, da Mozilla
- [`react-icons`](https://react-icons.github.io/react-icons/): ícones

> Por que o react-pdf **10** e não o 11? O 11 usa o PDF.js 6, que depende de um recurso de JavaScript muito novo (`Map.prototype.getOrInsertComputed`) e o PDF não abre em navegadores que ainda não o têm (versões um pouco mais antigas do Chrome, do Edge e do Safari). O 10 (PDF.js 5) funciona nos navegadores atuais.

## 🧪 Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção em `dist/` |
| `npm run preview` | Testa o build localmente |
| `npm run lint` | Lint com o oxlint (padrão do template atual do Vite) |

## 📄 Licença
Este projeto está licenciado sob a MIT License.
