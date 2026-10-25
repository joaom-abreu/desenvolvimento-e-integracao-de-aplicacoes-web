import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PedidoForm, { paraNumero } from "./PedidoForm.jsx";
import { ErroApi } from "../services/httpClient.js";

describe("paraNumero", () => {
  it("aceita vírgula e ponto", () => {
    expect(paraNumero("2,5")).toBe(2.5);
    expect(paraNumero("2.5")).toBe(2.5);
    expect(paraNumero("")).toBeNull();
    expect(paraNumero("abc")).toBeNull();
  });
});

describe("<PedidoForm />", () => {
  it("não envia com campos vazios e mostra o erro em cada campo", async () => {
    const onCriar = vi.fn();
    render(<PedidoForm onCriar={onCriar} />);

    await userEvent.click(screen.getByRole("button", { name: "Adicionar à fila" }));

    expect(onCriar).not.toHaveBeenCalled();
    expect(screen.getByText("Informe x.")).toBeInTheDocument();
    expect(screen.getByText("Informe o peso.")).toBeInTheDocument();
  });

  it("recusa coordenada fora da cidade (0 a 20)", async () => {
    render(<PedidoForm onCriar={vi.fn()} />);
    await userEvent.type(screen.getByLabelText("x (km)"), "25");
    await userEvent.click(screen.getByRole("button", { name: "Adicionar à fila" }));
    expect(screen.getByText("Entre 0 e 20.")).toBeInTheDocument();
  });

  it("envia números (com vírgula convertida) e a prioridade escolhida", async () => {
    const onCriar = vi.fn().mockResolvedValue({ cliente: "Ana" });
    render(<PedidoForm onCriar={onCriar} />);

    await userEvent.type(screen.getByLabelText("Cliente"), "Ana");
    await userEvent.type(screen.getByLabelText("x (km)"), "12,5");
    await userEvent.type(screen.getByLabelText("y (km)"), "7");
    await userEvent.type(screen.getByLabelText("Peso (kg)"), "2,5");
    await userEvent.click(screen.getByLabelText("Alta"));
    await userEvent.click(screen.getByRole("button", { name: "Adicionar à fila" }));

    expect(onCriar).toHaveBeenCalledWith({ cliente: "Ana", x: 12.5, y: 7, pesoKg: 2.5, prioridade: "ALTA" });
    expect(await screen.findByText("Pedido de Ana entrou na fila.")).toBeInTheDocument();
  });

  it("mostra a mensagem de regra de negócio vinda da API", async () => {
    const onCriar = vi.fn().mockRejectedValue(new ErroApi("O pacote de 18,00 kg excede a capacidade máxima da frota (15,0 kg).", 422));
    render(<PedidoForm onCriar={onCriar} />);

    await userEvent.type(screen.getByLabelText("x (km)"), "12");
    await userEvent.type(screen.getByLabelText("y (km)"), "7");
    await userEvent.type(screen.getByLabelText("Peso (kg)"), "18");
    await userEvent.click(screen.getByRole("button", { name: "Adicionar à fila" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("excede a capacidade máxima");
  });

  it("um clique no mapa preenche x e y", () => {
    render(<PedidoForm onCriar={vi.fn()} ponto={{ x: 3.4, y: 15 }} />);
    expect(screen.getByLabelText("x (km)")).toHaveValue("3,4");
    expect(screen.getByLabelText("y (km)")).toHaveValue("15");
  });
});
