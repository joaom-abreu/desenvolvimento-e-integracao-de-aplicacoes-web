// appConfig.js
// Tudo o que você talvez queira mudar fica aqui: endereços das APIs,
// tempos de espera e a lista de estados.

export const API = {
  VIACEP: "https://viacep.com.br/ws",
  BRASILAPI: "https://brasilapi.com.br/api",
  IBGE: "https://servicodados.ibge.gov.br/api/v1/localidades",
};

export const TIMING = {
  // Espera depois da última tecla antes de chamar a API (debounce)
  CEP_DEBOUNCE_MS: 400,
  STREET_DEBOUNCE_MS: 600,
  CNPJ_DEBOUNCE_MS: 500,
  DDD_DEBOUNCE_MS: 300,

  // Desiste da requisição depois desse tempo (AbortController)
  REQUEST_TIMEOUT_MS: 8000,
};

// Os 27 estados não mudam, então ficam aqui em vez de virem de uma API.
// As cidades, que são 5.571, vêm do IBGE (com a BrasilAPI de reserva).
export const UFS = [
  { sigla: "AC", nome: "Acre", regiao: "Norte" },
  { sigla: "AL", nome: "Alagoas", regiao: "Nordeste" },
  { sigla: "AP", nome: "Amapá", regiao: "Norte" },
  { sigla: "AM", nome: "Amazonas", regiao: "Norte" },
  { sigla: "BA", nome: "Bahia", regiao: "Nordeste" },
  { sigla: "CE", nome: "Ceará", regiao: "Nordeste" },
  { sigla: "DF", nome: "Distrito Federal", regiao: "Centro-Oeste" },
  { sigla: "ES", nome: "Espírito Santo", regiao: "Sudeste" },
  { sigla: "GO", nome: "Goiás", regiao: "Centro-Oeste" },
  { sigla: "MA", nome: "Maranhão", regiao: "Nordeste" },
  { sigla: "MT", nome: "Mato Grosso", regiao: "Centro-Oeste" },
  { sigla: "MS", nome: "Mato Grosso do Sul", regiao: "Centro-Oeste" },
  { sigla: "MG", nome: "Minas Gerais", regiao: "Sudeste" },
  { sigla: "PA", nome: "Pará", regiao: "Norte" },
  { sigla: "PB", nome: "Paraíba", regiao: "Nordeste" },
  { sigla: "PR", nome: "Paraná", regiao: "Sul" },
  { sigla: "PE", nome: "Pernambuco", regiao: "Nordeste" },
  { sigla: "PI", nome: "Piauí", regiao: "Nordeste" },
  { sigla: "RJ", nome: "Rio de Janeiro", regiao: "Sudeste" },
  { sigla: "RN", nome: "Rio Grande do Norte", regiao: "Nordeste" },
  { sigla: "RS", nome: "Rio Grande do Sul", regiao: "Sul" },
  { sigla: "RO", nome: "Rondônia", regiao: "Norte" },
  { sigla: "RR", nome: "Roraima", regiao: "Norte" },
  { sigla: "SC", nome: "Santa Catarina", regiao: "Sul" },
  { sigla: "SP", nome: "São Paulo", regiao: "Sudeste" },
  { sigla: "SE", nome: "Sergipe", regiao: "Nordeste" },
  { sigla: "TO", nome: "Tocantins", regiao: "Norte" },
];

export const REGIOES = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"];

export const UF_BY_SIGLA = Object.fromEntries(UFS.map((uf) => [uf.sigla, uf]));

// Exemplos dos botões "Usar exemplo"
export const EXAMPLES = {
  CEP: "30535-901", // PUC Minas, Coração Eucarístico (BH)
  STREET: { uf: "MG", cityCode: "3106200", street: "Afonso Pena" },
  CNPJ: "00.000.000/0001-91", // Banco do Brasil
  DDD: "31",
};

// Chave do localStorage para os endereços salvos
export const STORAGE_KEY = "consulta-brasil:enderecos";
