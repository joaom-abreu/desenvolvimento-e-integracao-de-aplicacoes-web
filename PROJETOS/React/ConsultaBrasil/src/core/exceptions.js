// exceptions.js
// Um tipo de erro para cada coisa que pode dar errado numa requisição.
// A interface usa o "name" para escolher o ícone e o "message" para o texto,
// e "retryable" diz se vale mostrar o botão "Tentar de novo".

export class ApiError extends Error {
  constructor(message, { source, status, retryable = true } = {}) {
    super(message);
    this.name = "ApiError";
    this.source = source; // "ViaCEP", "BrasilAPI", "IBGE"
    this.status = status; // código HTTP, quando houver
    this.retryable = retryable;
  }
}

/** A API respondeu, mas não achou nada (404 ou { erro: true } no ViaCEP). */
export class NotFoundError extends ApiError {
  constructor(message, options) {
    super(message, { ...options, retryable: false });
    this.name = "NotFoundError";
  }
}

/** O dado digitado está errado antes mesmo de chamar a API (400). */
export class InvalidInputError extends ApiError {
  constructor(message, options) {
    super(message, { ...options, retryable: false });
    this.name = "InvalidInputError";
  }
}

/** A API demorou mais que TIMING.REQUEST_TIMEOUT_MS. */
export class TimeoutError extends ApiError {
  constructor(source, ms) {
    super(`${source} demorou mais de ${ms / 1000} s para responder.`, { source });
    this.name = "TimeoutError";
  }
}

/** Sem internet, bloqueio de CORS ou servidor fora do ar. */
export class NetworkError extends ApiError {
  constructor(source) {
    super(`Não foi possível falar com ${source}. Confira sua conexão e tente de novo.`, { source });
    this.name = "NetworkError";
  }
}

/** Muitas requisições em pouco tempo (429). */
export class RateLimitError extends ApiError {
  constructor(source) {
    super(`${source} recebeu consultas demais. Espere alguns segundos e tente de novo.`, {
      source,
      status: 429,
    });
    this.name = "RateLimitError";
  }
}

/** Requisição cancelada de propósito (o usuário digitou outra coisa). */
export function isAbortError(error) {
  return error?.name === "AbortError";
}
