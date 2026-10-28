// brasilApiService.js
// BrasilAPI: https://brasilapi.com.br
// Projeto aberto que junta várias fontes públicas numa API só, gratuita e sem chave.

import { API } from "../config/appConfig";
import { fetchJson } from "../core/http";
import { onlyDigits, titleCase } from "../core/text";
import { cleanCnpj } from "../core/cnpj";

const SOURCE = "BrasilAPI";

/**
 * GET /cep/v2/30535901
 * Usado como reserva quando o ViaCEP falha. Não traz o código IBGE da cidade.
 */
export async function getAddressByCep(cep, { signal } = {}) {
  const result = await fetchJson(`${API.BRASILAPI}/cep/v2/${onlyDigits(cep)}`, {
    source: SOURCE,
    signal,
    notFoundMessage: "Esse CEP não foi encontrado em nenhuma base.",
  });
  const d = result.data;
  return {
    ...result,
    address: {
      cep: d.cep?.replace(/^(\d{5})(\d{3})$/, "$1-$2") ?? cep,
      street: d.street || "",
      complement: "",
      unit: "",
      neighborhood: d.neighborhood || "",
      city: d.city || "",
      cityCode: "",
      uf: d.state || "",
      state: "",
      region: "",
      ddd: "",
    },
  };
}

/** GET /cnpj/v1/00000000000191 — dados públicos da Receita Federal. */
export function getCnpj(cnpj, { signal } = {}) {
  return fetchJson(`${API.BRASILAPI}/cnpj/v1/${cleanCnpj(cnpj)}`, {
    source: SOURCE,
    signal,
    notFoundMessage: "A Receita Federal não tem nenhuma empresa com esse CNPJ.",
  });
}

/** GET /feriados/v1/2026 — feriados nacionais (inclui os móveis, como Carnaval e Páscoa). */
export function getHolidays(year, { signal } = {}) {
  return fetchJson(`${API.BRASILAPI}/feriados/v1/${year}`, { source: SOURCE, signal });
}

/** GET /ddd/v1/31 — estado e cidades atendidas pelo DDD. */
export async function getDdd(ddd, { signal } = {}) {
  const result = await fetchJson(`${API.BRASILAPI}/ddd/v1/${ddd}`, {
    source: SOURCE,
    signal,
    notFoundMessage: `O DDD ${ddd} não existe.`,
  });
  return {
    ...result,
    state: result.data.state,
    cities: [...result.data.cities].map(titleCase).sort((a, b) => a.localeCompare(b, "pt-BR")),
  };
}

/** GET /ibge/municipios/v1/MG — reserva para a lista de cidades do IBGE. */
export async function getCities(uf, { signal } = {}) {
  const result = await fetchJson(`${API.BRASILAPI}/ibge/municipios/v1/${uf}`, { source: SOURCE, signal });
  return {
    ...result,
    cities: result.data
      .map((c) => ({ code: String(c.codigo_ibge), name: titleCase(c.nome) }))
      .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
  };
}
