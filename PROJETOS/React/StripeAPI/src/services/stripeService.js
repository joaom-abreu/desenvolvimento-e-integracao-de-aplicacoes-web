import STRIPE_CONFIG from "../config/stripeConfig";

// Erro com o código que o servidor mandou (ver api/_stripe.js):
//   missing_key | invalid_key | live_key | invalid_order | rate_limited | stripe_error ...
export class PaymentError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

async function request(url, options) {
  let response;
  try {
    response = await fetch(url, options);
  } catch {
    throw new PaymentError("network", "Sem conexão com o servidor.");
  }

  // Sem a função (ex.: site estático sem /api), a rota devolve o index.html
  if ((response.headers.get("content-type") ?? "").includes("text/html")) {
    throw new PaymentError(
      "no_api",
      "A rota /api/stripe não existe aqui. Rode com npm run dev ou publique na Vercel."
    );
  }

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new PaymentError(body.error ?? "error", body.message ?? `HTTP ${response.status}`);
  }
  return body;
}

/**
 * Pede ao servidor um pagamento (PaymentIntent) para estes itens.
 * O servidor calcula o valor com os preços de src/data/products.js.
 *
 * items:    [{ id, quantity }]
 * customer: { name, email }
 * Devolve { id, clientSecret, amount, currency }
 */
export function createPayment(items, customer) {
  return request(STRIPE_CONFIG.API_PATH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, customer }),
  });
}

/**
 * Consulta o pagamento no servidor, que pergunta direto à Stripe.
 * Devolve { id, status, amount, currency, card: { brand, last4 }, receiptUrl, ... }
 */
export function getPayment(id) {
  return request(`${STRIPE_CONFIG.API_PATH}?id=${encodeURIComponent(id)}`);
}
