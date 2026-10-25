// Funções compartilhadas pelos testes de carga.
import http from "k6/http";
import { check } from "k6";

export const API = __ENV.API_URL || "http://localhost:8080";
const JSON_HEADERS = { headers: { "Content-Type": "application/json" } };
const PRIORIDADES = ["baixa", "baixa", "media", "media", "alta"];

/** Busca a base e as zonas uma vez (setup), para gerar só pedidos válidos. */
export function carregarMapa() {
  const cidade = http.get(`${API}/api/simulacao/status`).json();
  const zonas = http.get(`${API}/api/zonas`).json();
  return { base: cidade.base, zonas };
}

function dentroDeZona(x, y, zonas) {
  return zonas.some((z) => x >= z.xMin - 0.1 && x <= z.xMax + 0.1 && y >= z.yMin - 0.1 && y <= z.yMax + 0.1);
}

/** Um pedido aleatório a até 7 km da base e fora das zonas proibidas. */
export function pedidoAleatorio(mapa) {
  for (;;) {
    const ang = Math.random() * 2 * Math.PI;
    const raio = 0.5 + Math.random() * 6.5;
    const x = Math.round((mapa.base.x + raio * Math.cos(ang)) * 10) / 10;
    const y = Math.round((mapa.base.y + raio * Math.sin(ang)) * 10) / 10;
    if (!dentroDeZona(x, y, mapa.zonas)) {
      return {
        cliente: `k6-${__VU}-${__ITER}`,
        x,
        y,
        pesoKg: Math.round((0.2 + Math.random() * 3) * 10) / 10,
        prioridade: PRIORIDADES[Math.floor(Math.random() * PRIORIDADES.length)],
      };
    }
  }
}

export function criarPedido(mapa) {
  const r = http.post(`${API}/api/pedidos`, JSON.stringify(pedidoAleatorio(mapa)), {
    ...JSON_HEADERS,
    tags: { endpoint: "POST /api/pedidos" },
  });
  check(r, { "pedido criado (201)": (res) => res.status === 201 });
  return r;
}

export function consultarPainel() {
  const respostas = http.batch([
    ["GET", `${API}/api/drones/status`, null, { tags: { endpoint: "GET /api/drones/status" } }],
    ["GET", `${API}/api/entregas/rota`, null, { tags: { endpoint: "GET /api/entregas/rota" } }],
    ["GET", `${API}/api/pedidos/fila`, null, { tags: { endpoint: "GET /api/pedidos/fila" } }],
  ]);
  respostas.forEach((r) => check(r, { "consulta 200": (res) => res.status === 200 }));
}
