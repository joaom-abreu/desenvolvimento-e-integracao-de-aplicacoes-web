import { FiAlertTriangle, FiExternalLink } from "react-icons/fi";

// Aparece no lugar do checkout enquanto a VITE_STRIPE_PUBLISHABLE_KEY não estiver configurada
export default function KeyMissing() {
  return (
    <div className="sc-key-missing" role="alert">
      <FiAlertTriangle className="sc-key-icon" aria-hidden="true" />
      <h3>Configure as chaves da Stripe</h3>
      <p>O pagamento precisa das duas chaves de teste da sua conta Stripe.</p>

      <ol>
        <li>
          Crie uma conta grátis em{" "}
          <a href="https://dashboard.stripe.com/register" target="_blank" rel="noopener noreferrer">
            stripe.com <FiExternalLink aria-hidden="true" />
          </a>{" "}
          (para testar não precisa ativar a conta nem informar dados bancários).
        </li>
        <li>
          Abra as{" "}
          <a href="https://dashboard.stripe.com/test/apikeys" target="_blank" rel="noopener noreferrer">
            chaves de API de teste <FiExternalLink aria-hidden="true" />
          </a>{" "}
          e copie a <em>chave publicável</em> (<code>pk_test_</code>) e a <em>chave secreta</em> (
          <code>sk_test_</code>).
        </li>
        <li>
          Crie o arquivo <code>.env.local</code> na raiz do projeto com:
          <pre>{"VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...\nSTRIPE_SECRET_KEY=sk_test_..."}</pre>
        </li>
        <li>
          Pare e rode de novo o <code>npm run dev</code>.
        </li>
      </ol>
    </div>
  );
}
