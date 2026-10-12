// Centavos → "R$ 49,90"
export function formatMoney(cents, currency = "brl") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

// Timestamp da Stripe (segundos) → "11/10/2026, 14:32"
export function formatDate(seconds) {
  return new Date(seconds * 1000).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

// "visa" → "Visa", "amex" → "American Express"
const BRANDS = {
  amex: "American Express",
  diners: "Diners",
  discover: "Discover",
  elo: "Elo",
  jcb: "JCB",
  mastercard: "Mastercard",
  unionpay: "UnionPay",
  visa: "Visa",
};
export const formatBrand = (brand) => BRANDS[brand] ?? brand ?? "Cartão";
