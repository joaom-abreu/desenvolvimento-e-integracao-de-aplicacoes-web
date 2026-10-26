import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PalpiteForm from "./PalpiteForm.jsx";

const props = { minimo: 1, maximo: 100, jaTentados: [50] };

describe("<PalpiteForm />", () => {
  it("não envia vazio e mostra o erro no campo", async () => {
    const onPalpitar = vi.fn();
    render(<PalpiteForm {...props} onPalpitar={onPalpitar} />);

    await userEvent.click(screen.getByRole("button", { name: "Chutar" }));

    expect(onPalpitar).not.toHaveBeenCalled();
    expect(screen.getByText("Digite um número.")).toBeInTheDocument();
    expect(screen.getByLabelText("Seu palpite (1 a 100)")).toHaveAttribute("aria-invalid", "true");
  });

  it("recusa fora da faixa, decimal e repetido sem chamar a API", async () => {
    const onPalpitar = vi.fn();
    render(<PalpiteForm {...props} onPalpitar={onPalpitar} />);
    const campo = screen.getByLabelText("Seu palpite (1 a 100)");

    await userEvent.type(campo, "150{Enter}");
    expect(screen.getByText("Escolha um número entre 1 e 100.")).toBeInTheDocument();

    await userEvent.clear(campo);
    await userEvent.type(campo, "4,5{Enter}");
    expect(screen.getByText(/inteiro/)).toBeInTheDocument();

    await userEvent.clear(campo);
    await userEvent.type(campo, "50{Enter}");
    expect(screen.getByText("Você já tentou o 50. Escolha outro.")).toBeInTheDocument();

    expect(onPalpitar).not.toHaveBeenCalled();
  });

  it("envia o número e limpa o campo", async () => {
    const onPalpitar = vi.fn().mockResolvedValue({});
    render(<PalpiteForm {...props} onPalpitar={onPalpitar} />);
    const campo = screen.getByLabelText("Seu palpite (1 a 100)");

    await userEvent.type(campo, "42{Enter}");

    expect(onPalpitar).toHaveBeenCalledWith(42);
    expect(campo).toHaveValue("");
  });

  it("mantém o número no campo se a API recusar", async () => {
    const onPalpitar = vi.fn().mockRejectedValue(new Error("422"));
    render(<PalpiteForm {...props} onPalpitar={onPalpitar} />);
    const campo = screen.getByLabelText("Seu palpite (1 a 100)");

    await userEvent.type(campo, "42{Enter}");

    expect(campo).toHaveValue("42");
  });

  it("um clique no tabuleiro preenche o campo", () => {
    render(<PalpiteForm {...props} onPalpitar={vi.fn()} escolhido={{ numero: 37, vez: 1 }} />);
    expect(screen.getByLabelText("Seu palpite (1 a 100)")).toHaveValue("37");
  });
});
