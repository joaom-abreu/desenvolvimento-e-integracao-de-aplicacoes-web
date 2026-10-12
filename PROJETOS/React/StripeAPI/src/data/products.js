// products.js
// Catálogo da loja de exemplo. Este arquivo é usado nos DOIS lados:
//   • no navegador, para mostrar os produtos e o total do pedido;
//   • no servidor (api/_stripe.js), para calcular o valor que será COBRADO.
//
// Regra de ouro de pagamento: o navegador manda só { id, quantity } de cada item.
// O preço sai daqui, no servidor. Se o valor viesse do navegador, qualquer
// pessoa poderia abrir o DevTools e pagar R$ 0,01 por tudo.
//
// Por isso este arquivo não pode importar imagens, CSS nem JSX: o servidor
// (Node) também o lê. O ícone de cada produto é só um nome (ver Cart.jsx).

// Moeda da cobrança (código ISO em minúsculas, como a Stripe espera)
export const CURRENCY = "brl";

// Quantidade máxima de cada item no carrinho
export const MAX_QUANTITY = 10;

// Preços em CENTAVOS (inteiros): a Stripe trabalha sempre na menor unidade da
// moeda. R$ 49,90 → 4990. Assim não existe erro de arredondamento com float.
export const PRODUCTS = [
  {
    id: "semana-ti",
    name: "Inscrição na Semana de TI",
    description: "Três dias de palestras e oficinas no campus",
    price: 4990,
    icon: "ticket",
  },
  {
    id: "camiseta",
    name: "Camiseta Engenharia de Software",
    description: "Algodão, azul PUC, tamanhos P ao GG",
    price: 5990,
    icon: "shirt",
  },
  {
    id: "caneca",
    name: "Caneca PUC Minas",
    description: "Porcelana, 325 ml",
    price: 3490,
    icon: "coffee",
  },
  {
    id: "adesivos",
    name: "Kit de adesivos dev",
    description: "10 adesivos de linguagens e frameworks",
    price: 1200,
    icon: "sticker",
  },
];

// Carrinho inicial: { idDoProduto: quantidade }
export const INITIAL_CART = { "semana-ti": 1, camiseta: 1 };

/**
 * Monta o pedido a partir de [{ id, quantity }] e calcula o total.
 * Ignora itens com quantidade 0. Lança Error se algo for inválido.
 *
 * Devolve { lines: [{ product, quantity, subtotal }], total }
 */
export function buildOrder(items) {
  if (!Array.isArray(items)) throw new Error("Os itens do pedido são inválidos.");

  const lines = [];
  for (const item of items) {
    const product = PRODUCTS.find((p) => p.id === item?.id);
    if (!product) throw new Error(`Produto "${item?.id}" não existe.`);

    const quantity = Number(item.quantity);
    if (!Number.isInteger(quantity) || quantity < 0 || quantity > MAX_QUANTITY) {
      throw new Error(`Quantidade inválida para "${product.name}".`);
    }
    if (quantity === 0) continue;
    if (lines.some((line) => line.product.id === product.id)) {
      throw new Error(`"${product.name}" apareceu duas vezes no pedido.`);
    }

    lines.push({ product, quantity, subtotal: product.price * quantity });
  }

  const total = lines.reduce((sum, line) => sum + line.subtotal, 0);
  return { lines, total };
}

// { "semana-ti": 1, camiseta: 2 } → [{ id: "semana-ti", quantity: 1 }, ...]
export const cartToItems = (cart) =>
  Object.entries(cart)
    .filter(([, quantity]) => quantity > 0)
    .map(([id, quantity]) => ({ id, quantity }));
