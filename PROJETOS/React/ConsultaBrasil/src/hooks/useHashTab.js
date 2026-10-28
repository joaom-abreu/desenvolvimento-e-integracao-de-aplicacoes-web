import { useCallback, useEffect, useState } from "react";

/**
 * Aba atual guardada no endereço da página (#cnpj, #feriados...).
 * Assim dá para mandar o link de uma aba e o botão "voltar" funciona.
 */
export default function useHashTab(ids, fallback) {
  const read = useCallback(() => {
    const hash = window.location.hash.slice(1);
    return ids.includes(hash) ? hash : fallback;
  }, [ids, fallback]);

  const [tab, setTabState] = useState(read);

  useEffect(() => {
    const onChange = () => setTabState(read());
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, [read]);

  const setTab = useCallback((id) => {
    if (window.location.hash.slice(1) !== id) window.location.hash = id;
    setTabState(id);
  }, []);

  return [tab, setTab];
}
