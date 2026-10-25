const numero = (casas) =>
  new Intl.NumberFormat("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });

export const formatarKm = (km) => `${numero(1).format(km ?? 0)} km`;
export const formatarKg = (kg) => `${numero(kg % 1 === 0 ? 0 : 1).format(kg ?? 0)} kg`;
export const formatarMin = (min) => `${numero(0).format(Math.round(min ?? 0))} min`;
export const formatarPercentual = (p) => `${numero(0).format(Math.round(p ?? 0))}%`;
export const formatarDecimal = (v, casas = 2) => numero(casas).format(v ?? 0);

/** "12:04:31" a partir de um ISO-8601 (ou "—"). */
export function formatarHora(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

/** "(12,5 ; 7,0)" */
export const formatarCoordenada = (x, y) => `(${numero(1).format(x)} ; ${numero(1).format(y)})`;
