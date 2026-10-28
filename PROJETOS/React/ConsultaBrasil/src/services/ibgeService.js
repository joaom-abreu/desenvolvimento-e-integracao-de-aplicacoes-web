// ibgeService.js
// API de localidades do IBGE: https://servicodados.ibge.gov.br/api/docs/localidades

import { API } from "../config/appConfig";
import { fetchJson } from "../core/http";

/** GET /estados/MG/municipios?orderBy=nome — cidades do estado, já em ordem. */
export async function getCities(uf, { signal } = {}) {
  const result = await fetchJson(`${API.IBGE}/estados/${uf}/municipios?orderBy=nome`, {
    source: "IBGE",
    signal,
  });
  return {
    ...result,
    cities: result.data.map((c) => ({ code: String(c.id), name: c.nome })),
  };
}
