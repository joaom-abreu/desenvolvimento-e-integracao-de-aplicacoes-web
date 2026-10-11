import { useCallback, useEffect, useState } from "react";

/**
 * Carrega dados da ESPN e guarda o estado da tela.
 *
 *   const { status, data, error, reload } = useEspn(() => fetchNbaTeam("lal"), ["lal"]);
 *
 * status: "loading" | "ready" | "error". Enquanto troca de time, os dados
 * antigos continuam na tela (data) até os novos chegarem.
 */
export function useEspn(load, deps) {
  const [state, setState] = useState({ status: "loading", data: null, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setState((old) => ({ ...old, status: "loading", error: null }));

    load()
      .then((data) => active && setState({ status: "ready", data, error: null }))
      .catch((error) => active && setState((old) => ({ status: "error", data: old.data, error })));

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  return { ...state, reload };
}

/**
 * Hora de agora, renovada a cada `interval` ms (contagem regressiva).
 * Para enquanto a aba está escondida.
 */
export function useNow(interval = 1000) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const tick = () => document.visibilityState !== "hidden" && setNow(Date.now());
    const id = setInterval(tick, interval);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [interval]);

  return now;
}
