# PalpiteDTI · Front-end (React 19 + Vite)

Interface do jogo. A documentação completa está no [README principal](../README.md).

```bash
npm install
npm run dev          # http://localhost:5173 (API em http://localhost:8080 ou VITE_API_URL)
npm test             # Vitest + Testing Library
npm run build        # gera dist/ (o que o Vercel publica): SCSS -> CSS -> Autoprefixer
npm run dev:all      # back-end + front-end juntos (concurrently)
```

| Rota | Página |
| --- | --- |
| `/` | Jogar (tabuleiro, palpite, histórico) |
| `/ranking` | Ranking das partidas vencidas |
| `/estatisticas` | Indicadores e gráficos |
| `/design` | Design system |
