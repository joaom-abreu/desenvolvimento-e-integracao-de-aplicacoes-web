import { Children, useRef, useState } from "react";
import walletBody from "../../assets/images/carteira_corpo.png";
import walletPocket from "../../assets/images/carteira_bolso.png";
import "./Wallet.css";

/**
 * Porta-cartões em camadas, com os cartões saindo da carteira
 * (efeito adaptado do componente CarteiraFisica do projeto Meu Bolso):
 *
 *   1. imagem do CORPO (fundo)    decorativa, não recebe clique
 *   2. cartões (children)         HTML de verdade, entre as duas imagens
 *   3. imagem do BOLSO (frente)   decorativa, cobre a base dos cartões
 *
 * As duas imagens têm o mesmo tamanho (603 x 414), então ocupam a mesma caixa.
 *
 * Interação:
 *   • mouse: passar o mouse abre o leque; tirar o mouse fecha
 *   • toque: tocar na carteira abre/fecha
 *   • teclado: focar um cartão (Tab) abre o leque (:focus-within no CSS)
 *   • clicar num cartão o seleciona: ele SAI da carteira (à frente do bolso) e os
 *     outros voltam para dentro. Passar o mouse de novo abre o leque para trocar.
 *
 * <Wallet selectedIndex={1} label="Cartões de teste">
 *   <button>…</button>
 *   <button>…</button>
 * </Wallet>
 */
export default function Wallet({ selectedIndex = -1, keepOpen = false, label, children }) {
  const [open, setOpen] = useState(false);
  const lastPointer = useRef("mouse");

  const cards = Children.toArray(children);
  const hasSelection = selectedIndex >= 0 && selectedIndex < cards.length;
  const revealed = open || keepOpen;

  const className = [
    "wallet",
    revealed && "wallet-open",
    hasSelection && "wallet-has-selection",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={className}
      role="group"
      aria-label={label}
      onPointerDown={(e) => (lastPointer.current = e.pointerType)}
      onPointerEnter={(e) => e.pointerType === "mouse" && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === "mouse" && setOpen(false)}
      // No toque não existe "hover": o toque na carteira alterna aberta/fechada
      onClick={() => lastPointer.current !== "mouse" && setOpen((value) => !value)}
    >
      {/* .wallet-object mantém a proporção das imagens; o espaço para os
          cartões que sobem é reservado pelo padding-top do .wallet */}
      <div className="wallet-object">
        <img className="wallet-body" src={walletBody} alt="" aria-hidden="true" draggable="false" />

        {/* --i (índice) e --n (total) deixam o CSS montar o leque
            para qualquer quantidade de cartões */}
        <div className="wallet-fan" style={{ "--n": cards.length }}>
          {cards.map((card, i) => (
            <div
              key={card.key ?? i}
              className={i === selectedIndex ? "wallet-slot is-selected" : "wallet-slot"}
              style={{ "--i": i }}
              // Escolheu um cartão: fecha o leque para ele sair da carteira
              onClickCapture={() => setOpen(false)}
            >
              {card}
            </div>
          ))}
        </div>

        <img className="wallet-pocket" src={walletPocket} alt="" aria-hidden="true" draggable="false" />

        {/* Área "sólida" do bolso: a parte dos cartões escondida atrás dele
            não recebe hover nem clique (só o que aparece para fora) */}
        <span className="wallet-pocket-hit" aria-hidden="true" />
      </div>
    </div>
  );
}
