// Teste de carga: sobe até 50 jogadores simultâneos, mantém e desce.
// Cada um joga partidas inteiras e consulta ranking e estatísticas.
//   k6 run load-tests/carga.js
//   k6 run -e API_URL=https://palpite-dti-api.onrender.com load-tests/carga.js
import { sleep } from "k6";
import { consultarPaineis, jogarPartida } from "./comum.js";

export const options = {
  stages: [
    { duration: "30s", target: 10 },
    { duration: "1m", target: 50 },
    { duration: "2m", target: 50 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"],                                         // menos de 1% de erros
    http_req_duration: ["p(95)<800"],                                       // 95% abaixo de 800 ms
    "http_req_duration{endpoint:POST /api/partidas/{id}/palpites}": ["p(95)<300"],
    "http_req_duration{endpoint:GET /api/estatisticas}": ["p(95)<1500"],   // lê todas as partidas
    checks: ["rate>0.99"],
  },
};

export default function () {
  jogarPartida();
  consultarPaineis();
  sleep(1 + Math.random());
}
