// locationService.js
// Junta as APIs com "plano B": se a primeira falhar, tenta a segunda.
// Os componentes chamam só este arquivo e não precisam saber qual API respondeu.

import { isAbortError, NotFoundError } from "../core/exceptions";
import * as brasilApi from "./brasilApiService";
import * as ibge from "./ibgeService";
import * as viaCep from "./viaCepService";

async function withFallback(primary, secondary) {
  try {
    return await primary();
  } catch (error) {
    if (isAbortError(error)) throw error;
    try {
      const result = await secondary();
      return { ...result, fallbackFrom: error.source, fallbackReason: error.message };
    } catch (secondError) {
      if (isAbortError(secondError)) throw secondError;
      // Se uma disse "não existe", essa é a mensagem mais útil para quem digitou
      throw error instanceof NotFoundError ? error : secondError;
    }
  }
}

/** Endereço pelo CEP: ViaCEP, e BrasilAPI se o ViaCEP falhar. */
export const lookupCep = (cep, options) =>
  withFallback(
    () => viaCep.getAddressByCep(cep, options),
    () => brasilApi.getAddressByCep(cep, options)
  );

/** Cidades de um estado: IBGE, e BrasilAPI se o IBGE falhar. */
export const listCities = (uf, options) =>
  withFallback(
    () => ibge.getCities(uf, options),
    () => brasilApi.getCities(uf, options)
  );

export const searchCepByAddress = viaCep.searchCepByAddress;
