import { useMemo, useState } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { FiLoader, FiLock } from "react-icons/fi";
import { SiStripe } from "react-icons/si";
import STRIPE_CONFIG from "../../config/stripeConfig";
import { createPayment, getPayment } from "../../services/stripeService";
import { formatMoney } from "./format";
import TestCards from "./TestCards";

// O Stripe.js é carregado UMA vez, fora do componente. A Stripe exige que ele
// venha de js.stripe.com (por segurança ele não entra no bundle do Vite).
const stripePromise = STRIPE_CONFIG.PUBLISHABLE_KEY ? loadStripe(STRIPE_CONFIG.PUBLISHABLE_KEY) : null;

const MIN_AMOUNT = 50; // R$ 0,50, o mínimo que a Stripe aceita

/**
 * Formulário de pagamento com cartão. É o pedaço para reaproveitar:
 *
 * <StripePayment
 *   items={[{ id: "camiseta", quantity: 2 }]}   // o servidor calcula o valor
 *   amount={11980}                               // só para mostrar no botão (centavos)
 *   currency="brl"
 *   onSuccess={(payment) => ...}                 // payment já conferido no servidor
 *   onPayingChange={(paying) => ...}             // opcional: travar o carrinho enquanto paga
 * />
 *
 * Fluxo "deferred intent": o formulário abre sem nenhum pagamento criado; só
 * no clique em Pagar o servidor cria o PaymentIntent, com o valor certo.
 */
export default function StripePayment({ items, amount, currency, onSuccess, onPayingChange }) {
  // Opções do <Elements>. Quando o amount muda, o react-stripe-js atualiza o
  // formulário sozinho (elements.update), sem perder o que já foi digitado.
  const options = useMemo(
    () => ({
      mode: "payment",
      amount: Math.max(amount, MIN_AMOUNT),
      currency,
      paymentMethodTypes: ["card"], // igual ao api/_stripe.js
      locale: STRIPE_CONFIG.LOCALE,
      appearance: STRIPE_CONFIG.APPEARANCE,
      fonts: STRIPE_CONFIG.FONTS,
    }),
    [amount, currency]
  );

  return (
    <section className="sc-panel sc-payment" aria-labelledby="sc-payment-title">
      <header className="sc-panel-header">
        <h2 id="sc-payment-title">Pagamento</h2>
        <span className="sc-test-badge">Modo de teste</span>
      </header>

      <Elements stripe={stripePromise} options={options}>
        <PaymentForm
          items={items}
          amount={amount}
          currency={currency}
          onSuccess={onSuccess}
          onPayingChange={onPayingChange}
        />
      </Elements>

      <TestCards />

      <p className="sc-powered">
        <FiLock aria-hidden="true" />
        Pagamento processado pela
        <span className="sc-powered-brand">
          <SiStripe aria-hidden="true" />
          Stripe
        </span>
      </p>
    </section>
  );
}

function PaymentForm({ items, amount, currency, onSuccess, onPayingChange }) {
  const stripe = useStripe();
  const elements = useElements();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [ready, setReady] = useState(false);
  const [paying, setPayingState] = useState(false);
  const [error, setError] = useState(null);

  const setPaying = (value) => {
    setPayingState(value);
    onPayingChange?.(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements || paying) return;

    setPaying(true);
    setError(null);

    try {
      // 1. Valida o formulário do cartão (número, validade, CVC)
      const { error: formError } = await elements.submit();
      if (formError) throw formError;

      // 2. O servidor cria o pagamento com o valor calculado LÁ
      const { clientSecret } = await createPayment(items, { name, email });

      // 3. O Stripe.js envia o cartão direto para a Stripe e confirma.
      //    Se o banco pedir 3D Secure, a janela de autenticação abre aqui.
      const { error: payError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          // Só é usado por métodos que saem do site (ver StripeCheckout.jsx)
          return_url: `${window.location.origin}${window.location.pathname}`,
          payment_method_data: { billing_details: { name, email } },
        },
        redirect: "if_required",
      });
      if (payError) throw payError;

      // 4. Confere o resultado no servidor (a fonte da verdade é a Stripe)
      onSuccess?.(await getPayment(paymentIntent.id));
    } catch (err) {
      // Erros do cartão já vêm traduzidos pela Stripe ("Seu cartão foi recusado.")
      setError(err?.message ?? "Não foi possível concluir o pagamento.");
    } finally {
      setPaying(false);
    }
  };

  const canPay = stripe && ready && !paying && amount >= MIN_AMOUNT;

  return (
    <form className="sc-form" onSubmit={handleSubmit}>
      <div className="sc-fields">
        <label className="sc-field">
          <span>Nome no cartão</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="cc-name"
            placeholder="Maria da Silva"
            required
            disabled={paying}
          />
        </label>

        <label className="sc-field">
          <span>E-mail</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="maria@email.com"
            required
            disabled={paying}
          />
        </label>
      </div>

      {/* Número, validade e CVC: um iframe da Stripe. O cartão nunca passa pelo seu código. */}
      <PaymentElement
        options={{
          layout: "tabs",
          fields: { billingDetails: { name: "never", email: "never" } },
        }}
        onReady={() => setReady(true)}
        onLoadError={(event) =>
          setError(event.error?.message ?? "Não foi possível carregar o formulário da Stripe.")
        }
      />

      {error && (
        <p className="sc-error" role="alert">
          {error}
        </p>
      )}

      <button type="submit" className="sc-pay" disabled={!canPay}>
        {paying ? (
          <>
            <FiLoader className="sc-spin" aria-hidden="true" />
            Processando…
          </>
        ) : (
          `Pagar ${formatMoney(amount, currency)}`
        )}
      </button>
    </form>
  );
}
