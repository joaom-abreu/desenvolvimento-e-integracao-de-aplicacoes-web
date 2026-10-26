import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import GraficoBarras, { topoDoEixo } from "./GraficoBarras.jsx";

describe("<GraficoBarras />", () => {
  it("desenha uma barra por item e repete os dados numa tabela acessível", () => {
    const { container } = render(
      <GraficoBarras
        titulo="Tentativas até acertar"
        dados={[
          { rotulo: "1", valor: 2 },
          { rotulo: "2", valor: 5 },
          { rotulo: "3", valor: 0 },
        ]}
        destacar={(r) => r === "2"}
      />,
    );
    expect(screen.getByRole("img", { name: "Tentativas até acertar" })).toBeInTheDocument();
    expect(container.querySelectorAll(".grafico-barra")).toHaveLength(3);
    expect(container.querySelector('[data-destaque="true"] text').textContent).toBe("5");
    expect(screen.getByRole("table")).toHaveTextContent("Tentativas até acertar");
  });

  it("sem dados, convida a jogar", () => {
    render(<GraficoBarras titulo="Vazio" dados={[{ rotulo: "1", valor: 0 }]} />);
    expect(screen.getByText("Sem dados ainda. Jogue uma rodada.")).toBeInTheDocument();
  });

  it("topo do eixo é um número redondo", () => {
    expect(topoDoEixo(7)).toBe(10);
    expect(topoDoEixo(3)).toBe(5);
    expect(topoDoEixo(42)).toBe(50);
    expect(topoDoEixo(0)).toBe(1);
  });
});
