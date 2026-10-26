import { describe, expect, it } from "vitest";
import { formatarDuracao, formatarNumero, formatarPercentual, plural } from "./formatadores.js";

describe("formatadores", () => {
  it("duração em segundos e minutos", () => {
    expect(formatarDuracao(0)).toBe("0 s");
    expect(formatarDuracao(42)).toBe("42 s");
    expect(formatarDuracao(65)).toBe("1 min 05 s");
    expect(formatarDuracao(null)).toBe("–");
  });

  it("números e percentuais com vírgula", () => {
    expect(formatarNumero(6.25)).toBe("6,3");
    expect(formatarPercentual(66.7)).toBe("66,7%");
    expect(formatarNumero(undefined)).toBe("–");
  });

  it("plural", () => {
    expect(plural(1, "tentativa")).toBe("1 tentativa");
    expect(plural(7, "tentativa")).toBe("7 tentativas");
  });
});
