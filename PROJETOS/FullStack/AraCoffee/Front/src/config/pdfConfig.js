/**
 * Configuração do cardápio em PDF.
 *
 * O arquivo fica em public/cardapio/, então o Vite (e o Vercel) o servem
 * no endereço /cardapio/cardapio-aracoffee.pdf, sem passar pelo Spring Boot.
 *
 * O worker do PDF.js NÃO fica aqui: o README do react-pdf pede que ele seja
 * configurado no mesmo arquivo onde os componentes são usados
 * (src/pages/CardapioPdf.jsx).
 */
const PDF_CONFIG = {
  CARDAPIO_URL: "/cardapio/cardapio-aracoffee.pdf",
  NOME_ARQUIVO: "cardapio-aracoffee.pdf",
};

export default PDF_CONFIG;
