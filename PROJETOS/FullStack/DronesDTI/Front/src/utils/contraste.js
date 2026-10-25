// Contraste de cores pela fórmula da WCAG 2.1 (usado na página de design system).

function canal(c) {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

export function luminancia(hex) {
  const limpo = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(limpo.slice(i, i + 2), 16));
  return 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
}

/** Razão de contraste entre duas cores (de 1:1 a 21:1). */
export function razaoContraste(hexA, hexB) {
  const [claro, escuro] = [luminancia(hexA), luminancia(hexB)].sort((a, b) => b - a);
  return (claro + 0.05) / (escuro + 0.05);
}

/** Nível WCAG para texto comum: AAA (7:1), AA (4,5:1) ou "texto grande" (3:1). */
export function nivelWcag(razao) {
  if (razao >= 7) return "AAA";
  if (razao >= 4.5) return "AA";
  if (razao >= 3) return "AA texto grande";
  return "Reprova";
}
