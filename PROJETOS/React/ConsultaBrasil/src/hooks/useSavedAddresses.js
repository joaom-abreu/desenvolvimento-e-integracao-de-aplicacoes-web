import { useCallback, useState } from "react";
import { STORAGE_KEY } from "../config/appConfig";

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? [];
  } catch {
    return [];
  }
};

const persist = (list) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Navegação anônima ou armazenamento cheio: a lista fica só na memória
  }
};

/** Endereços salvos no navegador (localStorage). */
export default function useSavedAddresses() {
  const [list, setList] = useState(load);

  const update = useCallback((fn) => {
    setList((prev) => {
      const next = fn(prev);
      persist(next);
      return next;
    });
  }, []);

  const save = useCallback(
    (address) => update((prev) => [{ ...address, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, savedAt: Date.now() }, ...prev].slice(0, 20)),
    [update]
  );
  const remove = useCallback((id) => update((prev) => prev.filter((a) => a.id !== id)), [update]);

  return { list, save, remove };
}
