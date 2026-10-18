const formatador = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** 8.5 → "R$ 8,50" */
export function formatarPreco(valor) {
  return formatador.format(Number(valor) || 0);
}
