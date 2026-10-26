import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Chama "buscar" agora e depois a cada "intervaloMs".
 * Usado no ranking e nas estatísticas: outras pessoas podem estar jogando
 * ao mesmo tempo, então a tela pergunta "e agora?" de tempos em tempos.
 */
export function usePolling(buscar, intervaloMs = 5000) {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const buscarRef = useRef(buscar);
  buscarRef.current = buscar;

  const recarregar = useCallback(async () => {
    try {
      const resultado = await buscarRef.current();
      setDados(resultado);
      setErro(null);
    } catch (e) {
      setErro(e);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    recarregar();
    if (!intervaloMs) return undefined;
    const id = setInterval(recarregar, intervaloMs);
    return () => clearInterval(id);
  }, [recarregar, intervaloMs]);

  return { dados, erro, carregando, recarregar };
}
