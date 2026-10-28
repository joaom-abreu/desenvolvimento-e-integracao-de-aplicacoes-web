// text.js
// Funções de texto usadas em vários lugares.

/** Só os dígitos: "30535-901" → "30535901". */
export const onlyDigits = (value = "") => String(value).replace(/\D/g, "");

/** Sem acento e em minúsculas, para comparar ("São Paulo" === "sao paulo"). */
export const normalize = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const LOWER_WORDS = new Set(["de", "da", "do", "das", "dos", "e", "del", "d"]);

/**
 * "ABADIA DOS DOURADOS" → "Abadia dos Dourados".
 * A BrasilAPI devolve cidades em maiúsculas; o IBGE já vem certo.
 */
export function titleCase(value = "") {
  return String(value)
    .toLowerCase()
    .split(" ")
    .map((word, index) =>
      index > 0 && LOWER_WORDS.has(word) ? word : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ")
    .replace(/-(\p{L})/gu, (_, letter) => `-${letter.toUpperCase()}`)
    .replace(/'(\p{L})/gu, (_, letter) => `'${letter.toUpperCase()}`);
}
