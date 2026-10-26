import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import HistoricoPalpites from "./HistoricoPalpites.jsx";

describe("<HistoricoPalpites />", () => {
  it("lista vazia convida a começar", () => {
    render(<HistoricoPalpites palpites={[]} />);
    expect(screen.getByText("Nenhum palpite ainda")).toBeInTheDocument();
  });

  it("mostra o mais recente primeiro, com a resposta do juiz", () => {
    render(
      <HistoricoPalpites
        palpites={[
          { ordem: 1, numero: 50, resultado: "MAIOR" },
          { ordem: 2, numero: 25, resultado: "MENOR" },
        ]}
      />,
    );
    const itens = within(screen.getByRole("list", { name: "Palpites desta rodada" })).getAllByRole("listitem");
    expect(itens[0]).toHaveTextContent("2º25↑Menortente maior");
    expect(itens[1]).toHaveTextContent("1º50↓Maiortente menor");
  });
});
