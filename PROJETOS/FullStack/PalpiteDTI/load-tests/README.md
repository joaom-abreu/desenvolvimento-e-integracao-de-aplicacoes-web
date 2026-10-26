# Testes de carga (Grafana k6)

Cada usuário virtual joga **partidas inteiras** como uma pessoa atenta: começa com `POST /api/partidas`, chuta o meio da faixa possível (busca binária, sem conhecer o número) até acertar e consulta ranking e estatísticas. Um `check` confirma que nenhuma partida passou de 7 tentativas.

| Script | Cenário | Limites |
| --- | --- | --- |
| `smoke.js` | 1 usuário, 30 s | erro < 1%, p95 < 500 ms |
| `carga.js` | até 50 usuários por 2 min | erro < 1%, p95 < 800 ms, palpite p95 < 300 ms |
| `pico.js` | 0 a 200 usuários em 10 s | erro < 5%, p95 < 3 s |

```bash
k6 run load-tests/smoke.js
k6 run -e API_URL=https://palpite-dti-api.onrender.com load-tests/smoke.js
```

Com Prometheus + Grafana (API rodando em `localhost:8080`):

```bash
cd load-tests/observabilidade
docker compose up -d prometheus grafana
docker compose run --rm k6
```

Grafana em http://localhost:3000 › Dashboards › **PalpiteDTI - carga**.

> Os testes criam muitas partidas. Para limpar depois: `POST /api/simulacao/reiniciar?partidas=30`.
