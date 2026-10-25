import { describe, expect, it, vi } from "vitest";
import { ErroApi, requisicao } from "./httpClient.js";

const respostaFalsa = (status, corpo) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => corpo,
  text: async () => String(corpo),
});

describe("httpClient.requisicao", () => {
  it("devolve o JSON quando dá certo", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(respostaFalsa(200, { api: "online" }));
    await expect(requisicao("/api/status")).resolves.toEqual({ api: "online" });
  });

  it("envia o corpo como JSON no POST", async () => {
    const fetch = vi.spyOn(globalThis, "fetch").mockResolvedValue(respostaFalsa(201, { id: "p1" }));
    await requisicao("/api/pedidos", { metodo: "POST", corpo: { pesoKg: 2 } });
    const [, opcoes] = fetch.mock.calls[0];
    expect(opcoes.method).toBe("POST");
    expect(opcoes.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(opcoes.body)).toEqual({ pesoKg: 2 });
  });

  it("transforma o erro da API (422) em ErroApi com a mensagem do back-end", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      respostaFalsa(422, { mensagem: "O pacote excede a capacidade.", campos: {} }),
    );
    const erro = await requisicao("/api/pedidos", { metodo: "POST", corpo: {} }).catch((e) => e);
    expect(erro).toBeInstanceOf(ErroApi);
    expect(erro.status).toBe(422);
    expect(erro.message).toBe("O pacote excede a capacidade.");
  });

  it("explica quando o servidor está fora do ar", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));
    const erro = await requisicao("/api/status").catch((e) => e);
    expect(erro.status).toBe(0);
    expect(erro.message).toMatch(/back-end está rodando/);
  });

  it("204 No Content devolve null", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(respostaFalsa(204, null));
    await expect(requisicao("/api/drones/1", { metodo: "DELETE" })).resolves.toBeNull();
  });
});
