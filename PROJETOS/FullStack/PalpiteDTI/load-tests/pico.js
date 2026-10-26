// Teste de pico: de 0 a 200 jogadores em 10 s (ex.: link divulgado num evento).
//   k6 run load-tests/pico.js
import { sleep } from "k6";
import { consultarPaineis, jogarPartida } from "./comum.js";

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

export default function () {
  jogarPartida();
  if (Math.random() < 0.3) consultarPaineis();
  sleep(0.5 + Math.random());
}
