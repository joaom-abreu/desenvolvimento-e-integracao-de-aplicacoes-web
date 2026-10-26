import { describe, expect, it } from "vitest";
import { validarPalpite } from "./validacao.js";

const regras = { minimo: 1, maximo: 100, jaTentados: [50] };

describe("validarPalpite", () => {
  it("aceita inteiros dentro da faixa (com espaços em volta)", () => {
    expect(validarPalpite(" 42 ", regras)).toEqual({ numero: 42 });
    expect(validarPalpite("1", regras)).toEqual({ numero: 1 });
    expect(validarPalpite("100", regras)).toEqual({ numero: 100 });
  });

  it("recusa vazio, decimal e texto", () => {
    expect(validarPalpite("", regras).erro).toBe("Digite um número.");
    expect(validarPalpite("4,5", regras).erro).toMatch(/inteiro/);
    expect(validarPalpite("4.5", regras).erro).toMatch(/inteiro/);
    expect(validarPalpite("abc", regras).erro).toMatch(/inteiro/);
  });

  it("recusa fora de 1 a 100", () => {
    expect(validarPalpite("0", regras).erro).toBe("Escolha um número entre 1 e 100.");
    expect(validarPalpite("101", regras).erro).toBe("Escolha um número entre 1 e 100.");
    expect(validarPalpite("-3", regras).erro).toBe("Escolha um número entre 1 e 100.");
  });

  it("recusa número repetido", () => {
    expect(validarPalpite("50", regras).erro).toBe("Você já tentou o 50. Escolha outro.");
  });
});
