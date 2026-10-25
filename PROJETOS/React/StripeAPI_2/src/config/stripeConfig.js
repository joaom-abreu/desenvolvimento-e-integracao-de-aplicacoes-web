// stripeConfig.js
// Configurações do componente <StripeCheckout />.
//
// Por que aqui pode ter VITE_ (e a chave secreta não)?
// A chave PUBLICÁVEL da Stripe (pk_test_…) foi feita para ficar no navegador:
// o Stripe.js precisa dela para abrir o formulário de cartão. Ela não consegue
// cobrar nem ler pagamentos. Quem cria e consulta pagamentos é a chave SECRETA
// (STRIPE_SECRET_KEY), que fica só no servidor (api/_stripe.js).
//
// Os produtos e preços ficam em src/data/products.js.
const STRIPE_CONFIG = {
  PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,

  API_PATH: "/api/stripe",

  // Idioma do formulário e das mensagens de erro do cartão
  LOCALE: "pt-BR",

  // Nome da loja que aparece no resumo do pedido
  STORE_NAME: "Lojinha da PUC Minas",

  // Visual do formulário de cartão (Stripe Appearance API), nas cores da PUC.
  // Todas as opções: https://docs.stripe.com/elements/appearance-api
  APPEARANCE: {
    theme: "stripe",
    variables: {
      colorPrimary: "#005380",
      colorText: "#171717",
      colorTextSecondary: "#64748b",
      colorDanger: "#b91c1c",
      colorBackground: "#ffffff",
      fontFamily: "Montserrat, system-ui, sans-serif",
      fontSizeBase: "15px",
      borderRadius: "10px",
      spacingUnit: "4px",
    },
    rules: {
      ".Input": { borderColor: "#e2e8f0", boxShadow: "none" },
      ".Input:focus": { borderColor: "#005380", boxShadow: "0 0 0 3px rgba(0, 83, 128, 0.12)" },
      ".Label": { fontWeight: "500" },
    },
  },

  // A fonte Montserrat também dentro do formulário (ele roda num iframe da Stripe)
  FONTS: [{ cssSrc: "https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600&display=swap" }],

  // Cartões de teste que saem da carteira na tela: https://docs.stripe.com/testing
  //   tone: cor do cartão (ver .sc-tone-* em StripeCheckout.css)
  TEST_CARDS: [
    { number: "4242 4242 4242 4242", label: "Aprovado", brand: "VISA", tone: "success" },
    { number: "4000 0025 0000 3155", label: "Pede 3D Secure", brand: "VISA", tone: "secure" },
    { number: "4000 0000 0000 9995", label: "Saldo insuficiente", brand: "VISA", tone: "warning" },
    { number: "4000 0000 0000 0002", label: "Recusado pelo banco", brand: "VISA", tone: "danger" },
  ],

  // Validade e CVC mostrados nos cartões de teste (a Stripe aceita qualquer data futura e qualquer CVC)
  TEST_EXPIRY: "12/34",
  TEST_CVC: "123",
};

export default STRIPE_CONFIG;
