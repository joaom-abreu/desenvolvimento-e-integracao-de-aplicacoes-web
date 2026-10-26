import { describe, expect, it } from "vitest";
import { nivelWcag, razaoContraste } from "./contraste.js";

describe("contraste (WCAG 2.1)", () => {
  it("preto no branco é 21:1", () => {
    expect(razaoContraste("#000000", "#FFFFFF")).toBeCloseTo(21, 1);
  });

  it("a ordem das cores não importa", () => {
    expect(razaoContraste("#000066", "#FFFFFF")).toBeCloseTo(razaoContraste("#FFFFFF", "#000066"), 6);
  });

  it("branco no azul dti passa no AAA", () => {
    expect(nivelWcag(razaoContraste("#FFFFFF", "#000066"))).toBe("AAA");
  });

  it("classifica os níveis", () => {
    expect(nivelWcag(5)).toBe("AA");
    expect(nivelWcag(3.2)).toBe("AA texto grande");
    expect(nivelWcag(2)).toBe("Reprova");
  });
});
