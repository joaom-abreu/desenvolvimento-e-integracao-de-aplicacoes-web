import { useEffect, useRef, useState } from "react";
import { isAbortError } from "../core/exceptions";

/**
 * Faz uma requisição sempre que "key" muda, e cancela a anterior.
 *
 * Por que cancelar? Digite 30535-901 e, rápido, troque para 01001-000.
 * Se a primeira resposta chegar depois da segunda, a tela mostraria o
 * endereço errado (condição de corrida). O AbortController evita isso.
 *
 *   const cep = useRequest((signal) => lookupCep(valor, { signal }), valor, { enabled: completo });
 *   cep.status  // "idle" | "loading" | "success" | "error"
 *   cep.data    // resposta
 *   cep.error   // ApiError, NotFoundError, TimeoutError...
 *   cep.retry() // tenta de novo
 *
 * @param {(signal: AbortSignal) => Promise<any>} fetcher
 * @param {string|number|null} key  muda → nova requisição; null → não busca
 */
export default function useRequest(fetcher, key, { enabled = true, keepPrevious = false } = {}) {
  const [state, setState] = useState({ status: "idle", data: null, error: null });
  const [attempt, setAttempt] = useState(0);

  // Guarda sempre a versão mais nova do fetcher sem precisar dele nas dependências
  const fetcherRef = useRef(fetcher);
  useEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    if (!enabled || key === null || key === undefined || key === "") {
      setState({ status: "idle", data: null, error: null });
      return undefined;
    }

    const controller = new AbortController();
    setState((prev) => ({ status: "loading", data: keepPrevious ? prev.data : null, error: null }));

    fetcherRef
      .current(controller.signal)
      .then((data) => setState({ status: "success", data, error: null }))
      .catch((error) => {
        if (isAbortError(error)) return; // cancelada de propósito: ignora
        setState({ status: "error", data: null, error });
      });

    return () => controller.abort();
  }, [key, enabled, attempt, keepPrevious]);

  return { ...state, retry: () => setAttempt((n) => n + 1) };
}
