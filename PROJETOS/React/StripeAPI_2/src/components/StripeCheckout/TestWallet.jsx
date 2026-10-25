import { useEffect, useRef, useState } from "react";
import { FiCheck, FiCopy, FiMousePointer } from "react-icons/fi";
import STRIPE_CONFIG from "../../config/stripeConfig";
import Wallet from "../Wallet/Wallet";

/**
 * Carteira com os cartões de teste da Stripe.
 * Passe o mouse (ou toque) para os cartões abrirem em leque; clique em um
 * para tirá-lo da carteira e copiar o número. Depois é só colar no campo
 * "Número do cartão" (o formulário é um iframe da Stripe: por segurança,
 * nenhum código do site consegue preencher o cartão sozinho).
 */
export default function TestWallet() {
  const cards = STRIPE_CONFIG.TEST_CARDS;
  const [selected, setSelected] = useState(-1);
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const pick = async (index) => {
    setSelected(index);
    setCopied(false);
    clearTimeout(timer.current);

    try {
      await navigator.clipboard.writeText(cards[index].number.replaceAll(" ", ""));
      setCopied(true);
      timer.current = setTimeout(() => setCopied(false), 2500);
    } catch {
      // Sem permissão de área de transferência: o número continua visível para digitar
    }
  };

  const card = cards[selected];

  return (
    <section className="sc-panel sc-wallet" aria-labelledby="sc-wallet-title">
      <header className="sc-panel-header">
        <h2 id="sc-wallet-title">Carteira de teste</h2>
        <span className="sc-panel-hint">
          {cards.length} {cards.length === 1 ? "cartão" : "cartões"}
        </span>
      </header>

      <div className="sc-wallet-stage">
        <Wallet selectedIndex={selected} label="Cartões de teste da Stripe">
          {cards.map((item, index) => (
            <TestCard
              key={item.number}
              card={item}
              selected={index === selected}
              onSelect={() => pick(index)}
            />
          ))}
        </Wallet>
      </div>

      <div className="sc-wallet-info" aria-live="polite">
        {card ? (
          <>
            <div className="sc-wallet-picked">
              <span className={`sc-wallet-dot sc-tone-${card.tone}`} aria-hidden="true" />
              <strong>{card.label}</strong>
              <code>{card.number}</code>
            </div>
            <p className={copied ? "sc-wallet-hint is-copied" : "sc-wallet-hint"}>
              {copied ? (
                <>
                  <FiCheck aria-hidden="true" />
                  <span>
                    Número copiado: cole no campo <em>Número do cartão</em>.
                  </span>
                </>
              ) : (
                <>
                  <FiCopy aria-hidden="true" />
                  <span>Clique no cartão para copiar o número de novo.</span>
                </>
              )}
            </p>
          </>
        ) : (
          <p className="sc-wallet-hint">
            <FiMousePointer aria-hidden="true" />
            <span>
              Passe o mouse (ou toque) na carteira e escolha um cartão: ele sai da carteira e o
              número é copiado para você colar no formulário.
            </span>
          </p>
        )}

        <p className="sc-wallet-rules">
          Validade <strong>{STRIPE_CONFIG.TEST_EXPIRY}</strong> (ou qualquer data futura) · CVC{" "}
          <strong>{STRIPE_CONFIG.TEST_CVC}</strong> · qualquer CEP
        </p>
      </div>
    </section>
  );
}

// Cartão de teste (só a frente). As informações de cima ficam visíveis no leque.
function TestCard({ card, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`sc-test-card sc-tone-${card.tone}${selected ? " is-selected" : ""}`}
      onClick={(event) => {
        // não deixa o clique no cartão abrir/fechar a carteira
        event.stopPropagation();
        onSelect();
      }}
      aria-pressed={selected}
      aria-label={`${card.label}: ${card.number}. Copiar número`}
    >
      <span className="sc-test-card-top">
        <span className="sc-test-card-status">{card.label}</span>
        <span className="sc-test-card-brand">{card.brand}</span>
      </span>

      <span className="sc-test-card-chip" aria-hidden="true" />

      <span className="sc-test-card-number">{card.number}</span>

      <span className="sc-test-card-bottom">
        <span>Stripe · modo de teste</span>
        <span>{STRIPE_CONFIG.TEST_EXPIRY}</span>
      </span>
    </button>
  );
}
