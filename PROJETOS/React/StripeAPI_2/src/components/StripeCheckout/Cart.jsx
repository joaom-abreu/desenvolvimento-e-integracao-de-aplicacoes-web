import { FiMinus, FiPlus, FiShoppingBag } from "react-icons/fi";
import { LuCoffee, LuShirt, LuSticker, LuTicket } from "react-icons/lu";
import STRIPE_CONFIG from "../../config/stripeConfig";
import { MAX_QUANTITY, PRODUCTS } from "../../data/products";
import { formatMoney } from "./format";

// O catálogo guarda só o nome do ícone (ele também é lido pelo servidor)
const ICONS = { ticket: LuTicket, shirt: LuShirt, coffee: LuCoffee, sticker: LuSticker };

/**
 * Lista de produtos com quantidade e o total do pedido.
 * cart: { idDoProduto: quantidade } · total: em centavos
 */
export default function Cart({ cart, total, currency, onChange, disabled }) {
  const setQuantity = (id, quantity) =>
    onChange({ ...cart, [id]: Math.min(MAX_QUANTITY, Math.max(0, quantity)) });

  return (
    <section className="sc-panel sc-cart" aria-labelledby="sc-cart-title">
      <header className="sc-panel-header">
        <h2 id="sc-cart-title">Seu pedido</h2>
        <span className="sc-panel-hint">{STRIPE_CONFIG.STORE_NAME}</span>
      </header>

      <ul className="sc-products">
        {PRODUCTS.map((product) => {
          const Icon = ICONS[product.icon] ?? FiShoppingBag;
          const quantity = cart[product.id] ?? 0;

          return (
            <li key={product.id} className={quantity ? "sc-product in-cart" : "sc-product"}>
              <span className="sc-product-icon" aria-hidden="true">
                <Icon />
              </span>

              <div className="sc-product-info">
                <strong>{product.name}</strong>
                <span>{product.description}</span>
                <span className="sc-product-price">{formatMoney(product.price, currency)}</span>
              </div>

              {quantity === 0 ? (
                <button
                  type="button"
                  className="sc-add"
                  onClick={() => setQuantity(product.id, 1)}
                  disabled={disabled}
                >
                  Adicionar
                </button>
              ) : (
                <div className="sc-stepper" role="group" aria-label={`Quantidade de ${product.name}`}>
                  <button
                    type="button"
                    onClick={() => setQuantity(product.id, quantity - 1)}
                    disabled={disabled}
                    aria-label={quantity === 1 ? "Remover do pedido" : "Diminuir quantidade"}
                  >
                    <FiMinus aria-hidden="true" />
                  </button>
                  <output aria-live="polite">{quantity}</output>
                  <button
                    type="button"
                    onClick={() => setQuantity(product.id, quantity + 1)}
                    disabled={disabled || quantity >= MAX_QUANTITY}
                    aria-label="Aumentar quantidade"
                  >
                    <FiPlus aria-hidden="true" />
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      <footer className="sc-total">
        <span>Total</span>
        <strong>{formatMoney(total, currency)}</strong>
      </footer>

      {total === 0 && <p className="sc-empty">Adicione pelo menos um item para pagar.</p>}
    </section>
  );
}
