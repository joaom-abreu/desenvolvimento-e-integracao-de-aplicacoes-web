/**
 * Dados fixos da cafeteria, usados no rodapé, na página inicial e no Contato.
 * O endereço é o do campus Coração Eucarístico da PUC Minas (localização fictícia da AraCoffee).
 */
const ENDERECO_BUSCA = "PUC Minas, Av. Dom José Gaspar, 500, Coração Eucarístico, Belo Horizonte - MG";

const CAFETERIA = {
  nome: "AraCoffee",
  endereco: {
    rua: "Av. Dom José Gaspar, 500",
    bairro: "Coração Eucarístico",
    cidade: "Belo Horizonte, MG",
    cep: "30535-901",
    referencia: "Dentro do campus da PUC Minas, ao lado da biblioteca",
  },
  telefone: "(31) 3319-0000",
  whatsapp: "(31) 99999-0000",
  instagram: "@aracoffee.bh",
  horarios: [
    { dias: "Segunda a sexta", horas: "7h às 21h" },
    { dias: "Sábado", horas: "8h às 14h" },
    { dias: "Domingo", horas: "Fechado" },
  ],
  // Google Maps sem chave de API: o parâmetro output=embed permite usar a URL em um <iframe>
  mapaEmbed: `https://www.google.com/maps?q=${encodeURIComponent(ENDERECO_BUSCA)}&z=17&output=embed`,
  mapaLink: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ENDERECO_BUSCA)}`,
};

export default CAFETERIA;
