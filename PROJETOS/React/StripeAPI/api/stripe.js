// Vercel Function: /api/stripe
//   POST { items, customer } → cria o pagamento (PaymentIntent)
//   GET  ?id=pi_…            → consulta o pagamento
// Lê STRIPE_SECRET_KEY das Environment Variables da Vercel.
// A lógica fica em api/_stripe.js, que o vite.config.js também usa no npm run dev.

import { handleStripe } from "./_stripe.js";

export default function handler(req, res) {
  return handleStripe(req, res, process.env);
}
