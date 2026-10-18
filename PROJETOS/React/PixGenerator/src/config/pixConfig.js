// pixConfig.js
// Configurações centrais do projeto.
//
// Os limites vêm do Manual de Padrões para Iniciação do Pix (BR Code), do Banco Central.
const PIX_CONFIG = {
  // Identificador do arranjo Pix dentro do campo 26 (Merchant Account Information)
  GUI: "br.gov.bcb.pix",

  // Tipos de chave Pix aceitos no formulário
  KEY_TYPES: [
    { value: "cpf", label: "CPF", placeholder: "123.456.789-09" },
    { value: "cnpj", label: "CNPJ", placeholder: "12.ABC.345/01DE-35" },
    { value: "email", label: "E-mail", placeholder: "fulano@exemplo.com.br" },
    { value: "phone", label: "Celular", placeholder: "(31) 99999-9999" },
    { value: "random", label: "Aleatória", placeholder: "123e4567-e12b-12d1-a456-426655440000" },
  ],
  DEFAULT_KEY_TYPE: "cpf",

  // Tamanhos máximos dos campos do BR Code
  MAX_NAME: 25, // campo 59 (nome do recebedor)
  MAX_CITY: 15, // campo 60 (cidade do recebedor)
  MAX_TXID: 25, // campo 62-05 (identificador da transação)
  MAX_ACCOUNT_INFO: 99, // campo 26 inteiro (GUI + chave + descrição)
  MAX_AMOUNT: 9999999999.99, // campo 54 tem até 13 caracteres ("9999999999.99")

  // Sem identificador, o BR Code estático usa "***"
  EMPTY_TXID: "***",

  // QR Code
  QR_SIZES: [
    { value: 200, label: "Pequeno (200 px)" },
    { value: 280, label: "Médio (280 px)" },
    { value: 400, label: "Grande (400 px)" },
  ],
  DEFAULT_QR_SIZE: 280,
  QR_LEVEL: "M", // correção de erro: M é o recomendado para BR Code
  QR_MARGIN: 4, // "zona de silêncio" em módulos (o mínimo da norma do QR Code)
  QR_DOWNLOAD_SIZE: 1024, // PNG baixado sai com 1024 × 1024 px

  // Valores de exemplo para o botão "Preencher exemplo" (dados fictícios)
  EXAMPLE: {
    keyType: "email",
    key: "pix@pucminas.br",
    name: "PUC Minas",
    city: "Belo Horizonte",
    amount: "25,90",
    txid: "LANCHE0042",
    description: "Lanche da cantina",
    singleUse: false,
  },
};

export default PIX_CONFIG;
