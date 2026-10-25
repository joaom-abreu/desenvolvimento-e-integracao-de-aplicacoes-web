# DronesDTI · Front-end (React 19 + Vite)

Interface do simulador. A documentação completa está no [README principal](../README.md).

```bash
npm install
npm run dev          # http://localhost:5173 (API em http://localhost:8080 ou VITE_API_URL)
npm test             # Vitest + Testing Library
npm run build        # gera dist/ (o que o Vercel publica)
npm run dev:all      # back-end + front-end juntos (concurrently)
```

| Rota | Página |
| --- | --- |
| `/` | Centro de operações (mapa ao vivo + frota) |
| `/pedidos` | Novo pedido, fila, rastreio |
| `/rotas` | Viagens no ar e prévia do planejamento |
| `/dashboard` | Relatório |
| `/frota` | Drones e zonas de exclusão |
| `/design` | Design system |
