// http.js
// Um único lugar para fazer requisições. Ele resolve quatro coisas que
// todo fetch de verdade precisa e que o fetch() puro não faz sozinho:
//
//   1. Timeout: o fetch() espera para sempre; aqui ele desiste depois de N ms.
//   2. Cancelamento: se o usuário digitar outro CEP, a busca antiga é abortada.
//   3. Erros HTTP: o fetch() só falha sem rede; 404 e 500 chegam como "ok".
//   4. Cache: o mesmo endereço não é buscado duas vezes na mesma sessão.

import { TIMING } from "../config/appConfig";
import {
  ApiError,
  InvalidInputError,
  NetworkError,
  NotFoundError,
  RateLimitError,
  TimeoutError,
} from "./exceptions";

const cache = new Map();

/**
 * Busca um JSON.
 * @returns {Promise<{ data: any, url: string, ms: number, cached: boolean, source: string }>}
 */
export async function fetchJson(
  url,
  { source, signal, timeoutMs = TIMING.REQUEST_TIMEOUT_MS, notFoundMessage, useCache = true } = {}
) {
  if (useCache && cache.has(url)) {
    return { data: cache.get(url), url, ms: 0, cached: true, source };
  }

  // Um AbortController nosso, que é abortado pelo timeout OU pelo signal de fora
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);
  const forwardAbort = () => controller.abort();
  signal?.addEventListener("abort", forwardAbort);

  const started = performance.now();
  let response;

  try {
    response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
  } catch (error) {
    if (timedOut) throw new TimeoutError(source, timeoutMs);
    if (error.name === "AbortError") throw error; // cancelado: quem chamou ignora
    throw new NetworkError(source);
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", forwardAbort);
  }

  const ms = Math.round(performance.now() - started);

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const apiMessage = body?.message || body?.errors?.[0]?.message;

    if (response.status === 404) {
      throw new NotFoundError(notFoundMessage || apiMessage || "Nada encontrado.", {
        source,
        status: 404,
      });
    }
    if (response.status === 400) {
      throw new InvalidInputError(apiMessage || "Dado inválido.", { source, status: 400 });
    }
    if (response.status === 429) throw new RateLimitError(source);

    throw new ApiError(`${source} respondeu com erro ${response.status}. Tente de novo em instantes.`, {
      source,
      status: response.status,
    });
  }

  const data = await response.json();
  if (useCache) cache.set(url, data);
  return { data, url, ms, cached: false, source };
}

/** Esvazia o cache (útil para testar de novo uma consulta). */
export function clearCache() {
  cache.clear();
}
