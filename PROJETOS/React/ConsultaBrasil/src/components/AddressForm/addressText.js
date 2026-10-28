// addressText.js
// Endereço em texto, do jeito que vai numa etiqueta ou no Google Maps.

export function formatLines(a) {
  const first = [a.street, a.number].filter(Boolean).join(", ");
  return [
    a.complement ? `${first} – ${a.complement}` : first,
    a.neighborhood,
    `${a.city} – ${a.uf}`,
    `CEP ${a.cep}`,
  ].filter(Boolean);
}

export const formatOneLine = (a) => formatLines(a).join(", ");

export const mapsUrl = (text) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text)}`;
