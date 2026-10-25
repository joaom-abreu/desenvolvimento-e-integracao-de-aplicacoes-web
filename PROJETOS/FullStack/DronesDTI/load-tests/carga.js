// Teste de carga: sobe até 50 usuários simultâneos, mantém e desce.
// Cada usuário cria um pedido e consulta o painel (como a tela de Operação faz).
//   k6 run load-tests/carga.js
//   k6 run -e API_URL=https://drones-dti-api.onrender.com load-tests/carga.js
import { sleep } from "k6";
import { carregarMapa, consultarPainel, criarPedido } from "./comum.js";

export const options = {
  stages: [
    { duration: "30s", target: 10 },
    { duration: "1m", target: 50 },
    { duration: "2m", target: 50 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],                                // menos de 1% de erros
    http_req_duration: ["p(95)<800"],                              // 95% abaixo de 800 ms
    "http_req_duration{endpoint:POST /api/pedidos}": ["p(95)<500"],
    "http_req_duration{endpoint:GET /api/entregas/rota}": ["p(95)<1500"], // roda o planejador inteiro
    checks: ["rate>0.99"],
  },
};

export const setup = () => carregarMapa();

export default function (mapa) {
  criarPedido(mapa);
  consultarPainel();
  sleep(1 + Math.random());
}
