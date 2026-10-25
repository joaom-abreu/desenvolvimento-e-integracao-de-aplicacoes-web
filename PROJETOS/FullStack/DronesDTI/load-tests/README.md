# Testes de carga (Grafana k6)

Veja a seção [Testes de carga e observabilidade](../README.md#-testes-de-carga-e-observabilidade) do README principal.

```bash
k6 run load-tests/smoke.js        # 1 usuário, 30 s
k6 run load-tests/carga.js        # até 50 usuários
k6 run load-tests/pico.js         # 0 -> 200 usuários em 10 s
k6 run -e API_URL=https://drones-dti-api.onrender.com load-tests/smoke.js
```

Com Prometheus + Grafana: `cd observabilidade && docker compose up -d prometheus grafana && docker compose run --rm k6`.
