// Teste de pico (spike): de 0 a 200 usuários em 10 s. "O sistema aguenta uma avalanche?"
// k6 run load-tests/pico.js
import { sleep } from "k6";
import { carregarMapa, consultarPainel, criarPedido } from "./comum.js";

export const options = {
  stages: [
    { duration: "10s", target: 200 },
    { duration: "30s", target: 200 },
    { duration: "10s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.05"],
    http_req_duration: ["p(95)<3000"],
  },
};

export const setup = () => carregarMapa();

export default function (mapa) {
  criarPedido(mapa);
  consultarPainel();
  sleep(0.5);
}
