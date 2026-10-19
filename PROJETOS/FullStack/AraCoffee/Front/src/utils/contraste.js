/**
 * Razão de contraste entre duas cores (fórmula da WCAG 2.1).
 * contraste("#F1E3CF", "#1E130D") → 14.4
 */
const canal = (valor) => {
  const c = valor / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};

const luminancia = (hex) => {
  const limpo = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(limpo.slice(i, i + 2), 16));
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
};

export const contraste = (cor1, cor2) => {
  const [clara, escura] = [luminancia(cor1), luminancia(cor2)].sort((a, b) => b - a);
  return Math.round(((clara + 0.05) / (escura + 0.05)) * 10) / 10;
};

/** "AAA", "AA", "AA grande" (só títulos) ou "Não passa" */
export const nivelWcag = (razao) => {
  if (razao >= 7) return "AAA";
  if (razao >= 4.5) return "AA";
  if (razao >= 3) return "AA grande";
  return "Não passa";
};

/** 14.6 → "14,6:1" */
export const formatarRazao = (razao) => `${razao.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}:1`;
