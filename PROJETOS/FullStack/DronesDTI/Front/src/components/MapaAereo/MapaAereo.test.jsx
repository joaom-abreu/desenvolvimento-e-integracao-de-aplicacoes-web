import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import MapaAereo from "./MapaAereo.jsx";

describe("<MapaAereo />", () => {
  const props = {
    zonas: [{ id: "z1", nome: "Aeroporto", xMin: 12, yMin: 13, xMax: 15, yMax: 16 }],
    pedidos: [{ id: "p1", x: 3, y: 4, prioridade: "ALTA", status: "PENDENTE" }],
    drones: [{ id: "d1", nome: "Falcão", x: 11, y: 10, estado: "EM_VOO" }],
    viagens: [{ id: "v1", caminho: [{ x: 10, y: 10 }, { x: 3, y: 4 }, { x: 10, y: 10 }] }],
  };

  it("descreve o conteúdo para leitores de tela", () => {
    render(<MapaAereo {...props} />);
    expect(screen.getByRole("img")).toHaveAccessibleName(/1 drones, 1 pedidos e 1 zonas de exclusão/);
  });

  it("desenha zona, drone e rota", () => {
    const { container } = render(<MapaAereo {...props} />);
    expect(screen.getByText("Aeroporto")).toBeInTheDocument();
    expect(screen.getByText("Falcão")).toBeInTheDocument();
    expect(container.querySelectorAll(".rota-ativa")).toHaveLength(1);
  });

  it("inverte o eixo y (y cresce para cima, como no plano cartesiano)", () => {
    const { container } = render(<MapaAereo {...props} />);
    const pedido = container.querySelector(".pedido");
    expect(pedido).toHaveAttribute("cy", "16"); // altura 20 - y 4
  });
});
