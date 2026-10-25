import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import Dashboard from "./Dashboard.jsx";

vi.mock("../services/api.js", () => ({
  dashboardService: {
    indicadores: vi.fn().mockResolvedValue({
      entregasRealizadas: 42,
      pedidosPendentes: 3,
      pedidosEmAndamento: 2,
      pedidosCancelados: 0,
      viagensConcluidas: 15,
      tempoMedioEntregaMin: 18.4,
      tempoMedioViagemMin: 14,
      distanciaTotalKm: 210.5,
      mediaPacotesPorViagem: 2.8,
      ocupacaoMediaPercentual: 71,
      droneMaisEficiente: { id: "d2", nome: "Colibri", entregas: 20, viagens: 6, distanciaKm: 60, pesoKg: 30, entregasPorKm: 0.33, kgPorKm: 0.5 },
      ranking: [{ id: "d2", nome: "Colibri", entregas: 20, viagens: 6, distanciaKm: 60, pesoKg: 30, entregasPorKm: 0.33, kgPorKm: 0.5 }],
      entregasPorPrioridade: { BAIXA: 20, MEDIA: 12, ALTA: 10 },
      tempoMedioPorPrioridadeMin: { BAIXA: 25, MEDIA: 15, ALTA: 9 },
      mapaEntregas: [],
      ultimasViagens: [],
    }),
    mapaAscii: vi.fn().mockResolvedValue("B"),
    urlCsv: () => "http://localhost:8080/api/dashboard/entregas.csv",
  },
}));

describe("<Dashboard />", () => {
  it("mostra os indicadores pedidos no case", async () => {
    render(<Dashboard />);
    expect(await screen.findByText("42")).toBeInTheDocument();
    expect(screen.getByText("entregas realizadas")).toBeInTheDocument();
    expect(screen.getByText("18 min")).toBeInTheDocument();
    expect(screen.getAllByText("Colibri").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Baixar entregas (CSV)" })).toHaveAttribute(
      "href",
      "http://localhost:8080/api/dashboard/entregas.csv",
    );
  });
});
