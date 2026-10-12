import { useEffect, useMemo, useState } from "react";
import { FiLoader } from "react-icons/fi";
import STRIPE_CONFIG from "../../config/stripeConfig";
import { buildOrder, cartToItems, CURRENCY, INITIAL_CART } from "../../data/products";
import { getPayment } from "../../services/stripeService";
import Cart from "./Cart";
import KeyMissing from "./KeyMissing";
import PaymentResult from "./PaymentResult";
import StripePayment from "./StripePayment";
import "./StripeCheckout.css";

// Se o visitante voltou de um pagamento que saiu do site (Pix, boleto, banco...),
// a Stripe devolve ?payment_intent=pi_… na URL (ver return_url em StripePayment.jsx).
const returnedPaymentId = () => new URLSearchParams(window.location.search).get("payment_intent");

/**
 * Checkout completo de exemplo: carrinho + pagamento + recibo.
 * onPaymentSuccess(payment) é chamado quando o pagamento é aprovado (por
 * exemplo, para salvar o pedido no seu banco de dados).
 */
export default function StripeCheckout({ onPaymentSuccess }) {
  const [cart, setCart] = useState(INITIAL_CART);
  const [paying, setPaying] = useState(false);
  const [payment, setPayment] = useState(null);
  const [checking, setChecking] = useState(() => Boolean(returnedPaymentId()));

  // O total mostrado aqui usa a mesma função que o servidor usa para cobrar
  const items = useMemo(() => cartToItems(cart), [cart]);
  const { total } = useMemo(() => buildOrder(items), [items]);

  useEffect(() => {
    const id = returnedPaymentId();
    if (!id) return;

    // Limpa a URL (um F5 não mostra o recibo de novo)
    window.history.replaceState(null, "", window.location.pathname);
    getPayment(id)
      .then(setPayment)
      .catch((error) => setPayment({ status: "error", error: error.message }))
      .finally(() => setChecking(false));
  }, []);

  const handleSuccess = (result) => {
    setPayment(result);
    if (result.status === "succeeded") onPaymentSuccess?.(result);
  };

  const restart = () => {
    setPayment(null);
    setCart(INITIAL_CART);
  };

  if (!STRIPE_CONFIG.PUBLISHABLE_KEY) return <KeyMissing />;

  if (checking) {
    return (
      <p className="sc-checking" role="status">
        <FiLoader className="sc-spin" aria-hidden="true" />
        Conferindo o pagamento…
      </p>
    );
  }

  if (payment) return <PaymentResult payment={payment} onRestart={restart} />;

  return (
    <div className="stripe-checkout">
      <Cart cart={cart} total={total} currency={CURRENCY} onChange={setCart} disabled={paying} />
      <StripePayment
        items={items}
        amount={total}
        currency={CURRENCY}
        onSuccess={handleSuccess}
        onPayingChange={setPaying}
      />
    </div>
  );
}
