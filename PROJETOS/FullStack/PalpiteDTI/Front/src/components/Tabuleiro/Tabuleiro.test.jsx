import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Tabuleiro, { situacaoDoNumero } from "./Tabuleiro.jsx";

const palpites = [
  { numero: 50, resultado: "MAIOR" },
  { numero: 25, resultado: "MENOR" },
];
const possivel = { minimo: 26, maximo: 49 };

describe("situacaoDoNumero", () => {
  it("classifica palpites, possíveis e descartados", () => {
    expect(situacaoDoNumero(50, { palpites, possivel })).toBe("maior");
    expect(situacaoDoNumero(25, { palpites, possivel })).toBe("menor");
    expect(situacaoDoNumero(30, { palpites, possivel })).toBe("possivel");
    expect(situacaoDoNumero(80, { palpites, possivel })).toBe("descartado");
    expect(situacaoDoNumero(10, { palpites, possivel })).toBe("descartado");
    expect(situacaoDoNumero(73, { palpites: [], possivel: { minimo: 1, maximo: 100 }, revelado: 73 })).toBe("revelado");
  });
});

describe("<Tabuleiro />", () => {
  it("desenha 100 casas e resume a faixa possível em texto", () => {
    render(<Tabuleiro palpites={palpites} possivel={possivel} ativo />);
    expect(screen.getAllByRole("button")).toHaveLength(100);
    expect(screen.getByText(/O número está entre/)).toHaveTextContent("O número está entre 26 e 49 (24 possíveis)");
  });

  it("clicar numa casa possível escolhe o número; descartadas ficam desligadas", async () => {
    const onEscolher = vi.fn();
    render(<Tabuleiro palpites={palpites} possivel={possivel} ativo onEscolher={onEscolher} />);

    await userEvent.click(screen.getByRole("button", { name: "37: possivel" }));
    expect(onEscolher).toHaveBeenCalledWith(37);
    expect(screen.getByRole("button", { name: "80: descartado" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "50: maior" })).toBeDisabled();
  });

  it("marca o último palpite", () => {
    render(<Tabuleiro palpites={palpites} possivel={possivel} />);
    expect(screen.getByRole("button", { name: "25: menor" })).toHaveAttribute("data-ultimo", "true");
  });
});
