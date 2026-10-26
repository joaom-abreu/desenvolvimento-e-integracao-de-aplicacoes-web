import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Jogar from "./Jogar.jsx";
import { partidaService } from "../services/api.js";
import { ErroApi } from "../services/httpClient.js";

vi.mock("../services/api.js", () => ({
  partidaService: { iniciar: vi.fn(), buscar: vi.fn(), palpitar: vi.fn(), desistir: vi.fn() },
}));

const cem = { minimo: 1, maximo: 100, tamanho: 100 };
const partida = (extra = {}) => ({
  id: "p1",
  jogador: "Ana",
  status: "EM_ANDAMENTO",
  intervalo: cem,
  possivel: cem,
  tentativas: 0,
  tentativasIdeais: 7,
  palpites: [],
  numeroSecreto: null,
  ...extra,
});

const renderizar = () =>
  render(
    <MemoryRouter>
      <Jogar />
    </MemoryRouter>,
  );

describe("<Jogar /> (fluxo completo com a API mockada)", () => {
  it("começa uma rodada, recebe 'maior', depois acerta e vê a posição no ranking", async () => {
    partidaService.iniciar.mockResolvedValue(partida());
    partidaService.palpitar
      .mockResolvedValueOnce({
        palpite: { ordem: 1, numero: 50, resultado: "MAIOR" },
        mensagem: "50 é maior que o número sorteado. Tente um número menor.",
        dica: null,
        partida: partida({
          tentativas: 1,
          possivel: { minimo: 1, maximo: 49, tamanho: 49 },
          palpites: [{ ordem: 1, numero: 50, resultado: "MAIOR" }],
        }),
      })
      .mockResolvedValueOnce({
        palpite: { ordem: 2, numero: 42, resultado: "ACERTOU" },
        mensagem: "Acertou! O número era 42 e você precisou de 2 tentativas.",
        partida: partida({
          status: "VENCIDA",
          tentativas: 2,
          numeroSecreto: 42,
          duracaoSegundos: 12,
          classificacao: "EXCELENTE",
          posicaoRanking: 3,
          palpites: [
            { ordem: 1, numero: 50, resultado: "MAIOR" },
            { ordem: 2, numero: 42, resultado: "ACERTOU" },
          ],
        }),
      });

    renderizar();
    await userEvent.type(screen.getByLabelText("Seu nome no ranking"), "Ana");
    await userEvent.click(screen.getByRole("button", { name: "Começar rodada" }));
    expect(partidaService.iniciar).toHaveBeenCalledWith("Ana");

    await userEvent.type(await screen.findByLabelText("Seu palpite (1 a 100)"), "50{Enter}");
    expect(partidaService.palpitar).toHaveBeenCalledWith("p1", 50);
    expect(await screen.findByText("50 é maior que o número sorteado. Tente um número menor.")).toBeInTheDocument();
    expect(screen.getByText(/O número está entre/)).toHaveTextContent("entre 1 e 49");

    await userEvent.type(screen.getByLabelText("Seu palpite (1 a 100)"), "42{Enter}");
    expect(await screen.findByRole("heading", { name: "Acertou!" })).toBeInTheDocument();
    expect(screen.getByText("3º lugar no ranking")).toBeInTheDocument();
    expect(window.localStorage.getItem("palpitedti:ultima-vitoria")).toBe("p1");
  });

  it("mostra a mensagem de regra do jogo vinda da API (422)", async () => {
    partidaService.iniciar.mockResolvedValue(partida());
    partidaService.palpitar.mockRejectedValue(new ErroApi("Você já tentou o número 50 nesta partida. Escolha outro.", 422));

    renderizar();
    await userEvent.click(screen.getByRole("button", { name: "Começar rodada" }));
    await userEvent.type(await screen.findByLabelText("Seu palpite (1 a 100)"), "50{Enter}");

    expect(await screen.findByRole("alert")).toHaveTextContent("Você já tentou o número 50");
  });

  it("retoma a rodada salva depois de um F5", async () => {
    window.localStorage.setItem("palpitedti:partida", "p1");
    partidaService.buscar.mockResolvedValue(partida({ tentativas: 3 }));

    renderizar();

    expect(await screen.findByRole("heading", { name: "Rodada de Ana" })).toBeInTheDocument();
    expect(partidaService.buscar).toHaveBeenCalledWith("p1");
  });

  it("desistir revela o número", async () => {
    partidaService.iniciar.mockResolvedValue(partida());
    partidaService.desistir.mockResolvedValue(partida({ status: "ABANDONADA", numeroSecreto: 73 }));

    renderizar();
    await userEvent.click(screen.getByRole("button", { name: "Começar rodada" }));
    await userEvent.click(await screen.findByRole("button", { name: "Desistir e ver o número" }));

    expect(await screen.findByLabelText("O número era 73")).toBeInTheDocument();
  });
});
