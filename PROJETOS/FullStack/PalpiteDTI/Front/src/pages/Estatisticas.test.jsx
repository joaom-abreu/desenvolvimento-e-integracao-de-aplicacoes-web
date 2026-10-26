import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Estatisticas from "./Estatisticas.jsx";
import { estatisticaService } from "../services/api.js";

vi.mock("../services/api.js", () => ({ estatisticaService: { resumo: vi.fn() } }));

describe("<Estatisticas />", () => {
  it("mostra os indicadores e os três gráficos com a API mockada", async () => {
    estatisticaService.resumo.mockResolvedValue({
      totalPartidas: 32,
      vencidas: 30,
      abandonadas: 1,
      emAndamento: 1,
      taxaVitoria: 96.8,
      mediaTentativas: 6.2,
      melhorTentativas: 2,
      tentativasIdeais: 7,
      percentualNoIdeal: 70,
      duracaoMediaSegundos: 75,
      distribuicaoTentativas: [{ rotulo: "1", valor: 0 }, { rotulo: "7", valor: 9 }],
      primeirosPalpites: [{ rotulo: "50", valor: 12 }],
      sorteiosPorFaixa: [{ rotulo: "1–10", valor: 3 }],
    });

    render(<Estatisticas />);

    expect(await screen.findByText("32")).toBeInTheDocument();
    expect(screen.getByText("96,8%")).toBeInTheDocument();
    expect(screen.getByText("1 min 15 s")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Tentativas até acertar" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Primeiro palpite mais comum" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Números sorteados por faixa" })).toBeInTheDocument();
  });
});
