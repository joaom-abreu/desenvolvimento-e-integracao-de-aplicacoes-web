import { describe, expect, it } from "vitest";
import { formatarCoordenada, formatarKg, formatarKm, formatarMin, formatarPercentual } from "./formatadores.js";

describe("formatadores (pt-BR)", () => {
  it("km com uma casa e vírgula", () => {
    expect(formatarKm(12.345)).toBe("12,3 km");
  });

  it("kg inteiro sem casas e quebrado com uma", () => {
    expect(formatarKg(10)).toBe("10 kg");
    expect(formatarKg(2.5)).toBe("2,5 kg");
  });

  it("minutos e porcentagem arredondados", () => {
    expect(formatarMin(14.6)).toBe("15 min");
    expect(formatarPercentual(66.4)).toBe("66%");
  });

  it("coordenada", () => {
    expect(formatarCoordenada(3, 4.25)).toBe("(3,0 ; 4,3)");
  });
});
