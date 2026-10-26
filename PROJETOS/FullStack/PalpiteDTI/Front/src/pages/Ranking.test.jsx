import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Ranking from "./Ranking.jsx";
import { rankingService } from "../services/api.js";

vi.mock("../services/api.js", () => ({ rankingService: { top: vi.fn() } }));

const renderizar = () =>
  render(
    <MemoryRouter>
      <Ranking />
    </MemoryRouter>,
  );

describe("<Ranking />", () => {
  it("mostra a tabela, marca robôs e destaca a última vitória deste navegador", async () => {
    window.localStorage.setItem("palpitedti:ultima-vitoria", "p2");
    rankingService.top.mockResolvedValue([
      { posicao: 1, partidaId: "p1", jogador: "Sofia", tentativas: 4, duracaoSegundos: 31, classificacao: "EXCELENTE", finalizadaEm: "2026-10-26T12:00:00Z", robo: true },
      { posicao: 2, partidaId: "p2", jogador: "Ana", tentativas: 6, duracaoSegundos: 65, classificacao: "EXCELENTE", finalizadaEm: "2026-10-26T12:05:00Z", robo: false },
    ]);

    renderizar();

    const linhas = await screen.findAllByRole("row");
    expect(linhas).toHaveLength(3);
    expect(within(linhas[1]).getByText("robô")).toBeInTheDocument();
    expect(linhas[2]).toHaveAttribute("data-destaque", "true");
    expect(within(linhas[2]).getByText("1 min 05 s")).toBeInTheDocument();
    expect(rankingService.top).toHaveBeenCalledWith(10);
  });

  it("ranking vazio convida a jogar", async () => {
    rankingService.top.mockResolvedValue([]);
    renderizar();
    expect(await screen.findByText("Ninguém acertou ainda")).toBeInTheDocument();
  });

  it("servidor fora do ar mostra a mensagem do erro", async () => {
    rankingService.top.mockRejectedValue(new Error("Não foi possível falar com o servidor."));
    renderizar();
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível falar com o servidor.");
  });
});
