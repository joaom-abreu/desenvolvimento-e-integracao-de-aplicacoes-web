// viaCepService.js
// ViaCEP: https://viacep.com.br
// Gratuito, sem chave e com CORS liberado (dá para chamar direto do navegador).

import { API } from "../config/appConfig";
import { NotFoundError } from "../core/exceptions";
import { fetchJson } from "../core/http";
import { onlyDigits } from "../core/text";

const SOURCE = "ViaCEP";

/** Converte a resposta do ViaCEP para o formato de endereço do projeto. */
const toAddress = (data) => ({
  cep: data.cep,
  street: data.logradouro || "",
  complement: data.complemento || "",
  unit: data.unidade || "",
  neighborhood: data.bairro || "",
  city: data.localidade || "",
  cityCode: data.ibge || "",
  uf: data.uf || "",
  state: data.estado || "",
  region: data.regiao || "",
  ddd: data.ddd || "",
});

/**
 * GET https://viacep.com.br/ws/30535901/json/
 *
 * Atenção: CEP que não existe NÃO volta 404. Volta 200 com { "erro": "true" }.
 * Por isso o teste do "erro" depois do fetch.
 */
export async function getAddressByCep(cep, { signal } = {}) {
  const result = await fetchJson(`${API.VIACEP}/${onlyDigits(cep)}/json/`, { source: SOURCE, signal });

  if (result.data.erro) {
    throw new NotFoundError("Esse CEP não existe ou não está na base do ViaCEP.", { source: SOURCE });
  }
  return { ...result, address: toAddress(result.data) };
}

/**
 * Busca reversa: GET https://viacep.com.br/ws/MG/Belo Horizonte/Afonso Pena/json/
 * Cidade e rua precisam de pelo menos 3 letras. Volta no máximo 50 resultados.
 */
export async function searchCepByAddress(uf, city, street, { signal } = {}) {
  const url = `${API.VIACEP}/${uf}/${encodeURIComponent(city)}/${encodeURIComponent(street.trim())}/json/`;
  const result = await fetchJson(url, { source: SOURCE, signal });

  if (!Array.isArray(result.data) || result.data.length === 0) {
    throw new NotFoundError(`Nenhum CEP encontrado para “${street.trim()}” em ${city}.`, { source: SOURCE });
  }
  return { ...result, addresses: result.data.map(toAddress) };
}
