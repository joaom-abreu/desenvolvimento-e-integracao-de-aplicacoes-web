// format.js
// Formatação pt-BR usada nos componentes.

const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export const formatMoney = (value) => (value == null ? "Livre: quem paga digita" : BRL.format(value));

export const KEY_LABELS = {
  cpf: "CPF",
  cnpj: "CNPJ",
  email: "E-mail",
  phone: "Celular",
  random: "Aleatória",
  dynamic: "Pix dinâmico (URL)",
  unknown: "Não reconhecida",
};

/** Nome do arquivo baixado: "pix-puc-minas-25-90.png" */
export function fileNameFor(result, extension) {
  const slug = result.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  const value = result.amount ? `-${result.amount.toFixed(2).replace(".", "-")}` : "";
  return `pix-${slug || "qrcode"}${value}.${extension}`;
}
