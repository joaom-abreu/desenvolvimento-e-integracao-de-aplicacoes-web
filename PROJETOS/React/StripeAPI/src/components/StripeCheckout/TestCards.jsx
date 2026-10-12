import { useState } from "react";
import { FiCheck, FiChevronDown, FiCopy } from "react-icons/fi";
import STRIPE_CONFIG from "../../config/stripeConfig";

// Cartões de teste da Stripe, com botão de copiar
export default function TestCards() {
  const [copied, setCopied] = useState(null);

  const copy = async (number) => {
    try {
      await navigator.clipboard.writeText(number.replaceAll(" ", ""));
      setCopied(number);
      setTimeout(() => setCopied((current) => (current === number ? null : current)), 1500);
    } catch {
      // Sem permissão de área de transferência: o número continua visível para digitar
    }
  };

  return (
    <details className="sc-test-cards">
      <summary>
        Cartões de teste
        <FiChevronDown className="sc-chevron" aria-hidden="true" />
      </summary>

      <p>Use qualquer data futura, qualquer CVC e qualquer CEP.</p>

      <ul>
        {STRIPE_CONFIG.TEST_CARDS.map((card) => (
          <li key={card.number}>
            <button type="button" onClick={() => copy(card.number)} title="Copiar número">
              <code>{card.number}</code>
              {copied === card.number ? (
                <FiCheck className="sc-copied" aria-label="Copiado" />
              ) : (
                <FiCopy aria-hidden="true" />
              )}
            </button>
            <span>{card.label}</span>
          </li>
        ))}
      </ul>
    </details>
  );
}
