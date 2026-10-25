// Teste de fumaça: 1 usuário por 30 s. "A API está de pé e responde certo?"
// k6 run load-tests/smoke.js
import { sleep } from "k6";
import { carregarMapa, consultarPainel, criarPedido } from "./comum.js";

export const options = {
  vus: 1,
  duration: "30s",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
  },
};

export const setup = () => carregarMapa();

export default function (mapa) {
  criarPedido(mapa);
  consultarPainel();
  sleep(1);
}
