import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import DroneLista from "./DroneLista.jsx";

const drone = {
  id: "d1",
  nome: "Falcão",
  estado: "EM_VOO",
  bateria: 18.4,
  cargaKg: 6.5,
  capacidadeKg: 10,
  pacotes: 3,
  entregasRealizadas: 12,
  viagemAtualId: "v1",
  progressoPercentual: 40,
  proximaParada: "Marina",
};

describe("<DroneLista />", () => {
  it("mostra nome, estado, carga e próxima entrega", () => {
    render(<DroneLista drones={[drone]} />);
    expect(screen.getByRole("heading", { name: "Falcão" })).toBeInTheDocument();
    expect(screen.getByText("Em voo")).toBeInTheDocument();
    expect(screen.getByText("6,5 kg de 10 kg")).toBeInTheDocument();
    expect(screen.getByText("Próxima entrega: Marina")).toBeInTheDocument();
  });

  it("bateria abaixo de 25% fica vermelha", () => {
    const { container } = render(<DroneLista drones={[drone]} />);
    expect(screen.getByRole("meter", { name: "Bateria" })).toHaveAttribute("aria-valuenow", "18");
    expect(container.querySelector(".bateria-nivel")).toHaveAttribute("data-nivel", "baixa");
  });

  it("frota vazia mostra orientação", () => {
    render(<DroneLista drones={[]} />);
    expect(screen.getByText("Nenhum drone na frota")).toBeInTheDocument();
  });
});
