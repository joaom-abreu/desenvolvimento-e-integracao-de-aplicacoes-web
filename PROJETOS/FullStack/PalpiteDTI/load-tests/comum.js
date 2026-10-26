// Funções usadas pelos três cenários (smoke, carga e pico).
// Cada usuário virtual joga uma partida inteira como uma pessoa atenta:
// busca binária a partir das respostas da API (ele NÃO conhece o número sorteado).
import http from "k6/http";
import { check } from "k6";

export const API = (__ENV.API_URL || "http://localhost:8080").replace(/\/+$/, "");
const JSON_HEADERS = { headers: { "Content-Type": "application/json" } };

/** Começa uma partida, chuta até acertar e devolve quantas tentativas levou. */
export function jogarPartida() {
  const nova = http.post(`${API}/api/partidas`, JSON.stringify({ jogador: `k6-${__VU}` }), {
    ...JSON_HEADERS,
    tags: { endpoint: "POST /api/partidas" },
  });
  check(nova, { "partida criada (201)": (r) => r.status === 201 });
  if (nova.status !== 201) return 0;

  const partida = nova.json();
  let { minimo, maximo } = partida.possivel;
  for (let tentativa = 1; tentativa <= 20; tentativa++) {
    const numero = Math.floor((minimo + maximo) / 2);
    const r = http.post(`${API}/api/partidas/${partida.id}/palpites`, JSON.stringify({ numero }), {
      ...JSON_HEADERS,
      tags: { endpoint: "POST /api/partidas/{id}/palpites" },
    });
    check(r, { "palpite registrado (201)": (res) => res.status === 201 });
    if (r.status !== 201) return 0;
    const corpo = r.json();
    if (corpo.palpite.resultado === "ACERTOU") {
      check(corpo, { "busca binária acerta em até 7": (c) => c.partida.tentativas <= 7 });
      return corpo.partida.tentativas;
    }
    ({ minimo, maximo } = corpo.partida.possivel);
  }
  return 0;
}

/** O que as telas Ranking e Estatísticas pedem. */
export function consultarPaineis() {
  const ranking = http.get(`${API}/api/ranking`, { tags: { endpoint: "GET /api/ranking" } });
  const estatisticas = http.get(`${API}/api/estatisticas`, { tags: { endpoint: "GET /api/estatisticas" } });
  check(ranking, { "ranking 200": (r) => r.status === 200 });
  check(estatisticas, { "estatísticas 200": (r) => r.status === 200 });
}
