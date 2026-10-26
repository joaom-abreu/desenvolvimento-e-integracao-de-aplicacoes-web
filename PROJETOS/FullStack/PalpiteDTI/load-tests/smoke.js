// Teste de fumaça: 1 usuário por 30 s. Serve para ver se está tudo de pé.
//   k6 run load-tests/smoke.js
import { sleep } from "k6";
import { consultarPaineis, jogarPartida } from "./comum.js";

export const options = {
  vus: 1,
  duration: "30s",
  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<500"],
    checks: ["rate>0.99"],
  },
};

export default function () {
  jogarPartida();
  consultarPaineis();
  sleep(1);
}
