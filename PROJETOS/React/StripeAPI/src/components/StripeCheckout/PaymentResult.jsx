import { FiAlertCircle, FiCheckCircle, FiClock, FiExternalLink, FiRotateCcw } from "react-icons/fi";
import { formatBrand, formatDate, formatMoney } from "./format";

// Como mostrar cada status do PaymentIntent
// https://docs.stripe.com/payments/paymentintents/lifecycle
const STATUS = {
  succeeded: { icon: FiCheckCircle, tone: "success", title: "Pagamento aprovado" },
  processing: { icon: FiClock, tone: "warning", title: "Pagamento em processamento" },
};
const NOT_PAID = { icon: FiAlertCircle, tone: "error", title: "Pagamento não concluído" };

/**
 * Recibo do pagamento, com os dados que o SERVIDOR leu da Stripe.
 * payment: resposta de GET /api/stripe?id=pi_…
 */
export default function PaymentResult({ payment, onRestart }) {
  const { icon: Icon, tone, title } = STATUS[payment.status] ?? NOT_PAID;
  const testMode = payment.livemode === false;

  return (
    <div className={`sc-result ${tone}`} role="status">
      <Icon className="sc-result-icon" aria-hidden="true" />
      <h2>{title}</h2>

      {payment.status === "succeeded" && (
        <p>Nenhum valor foi cobrado de verdade: este pagamento foi feito no modo de teste da Stripe.</p>
      )}
      {payment.status === "processing" && (
        <p>A Stripe ainda está confirmando o pagamento. Consulte o status de novo em instantes.</p>
      )}
      {!STATUS[payment.status] && (
        <p>{payment.error ?? "O pagamento não foi finalizado. Tente de novo com outro cartão."}</p>
      )}

      {payment.id && (
        <dl className="sc-receipt">
          <div>
            <dt>Valor</dt>
            <dd>{formatMoney(payment.amount, payment.currency)}</dd>
          </div>
          {payment.card && (
            <div>
              <dt>Cartão</dt>
              <dd>
                {formatBrand(payment.card.brand)} terminado em {payment.card.last4}
              </dd>
            </div>
          )}
          {payment.created && (
            <div>
              <dt>Data</dt>
              <dd>{formatDate(payment.created)}</dd>
            </div>
          )}
          {payment.description && (
            <div>
              <dt>Itens</dt>
              <dd>{payment.description.replace(/^Pedido: /, "")}</dd>
            </div>
          )}
          <div>
            <dt>Código</dt>
            <dd>
              <code>{payment.id}</code>
            </dd>
          </div>
        </dl>
      )}

      <div className="sc-result-actions">
        {payment.receiptUrl && (
          <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer" className="sc-link-button">
            Ver recibo da Stripe <FiExternalLink aria-hidden="true" />
          </a>
        )}
        {payment.id && (
          <a
            href={`https://dashboard.stripe.com/${testMode ? "test/" : ""}payments/${payment.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="sc-link-button"
          >
            Abrir no painel da Stripe <FiExternalLink aria-hidden="true" />
          </a>
        )}
        <button type="button" className="sc-pay" onClick={onRestart}>
          <FiRotateCcw aria-hidden="true" />
          Fazer outro pedido
        </button>
      </div>
    </div>
  );
}
