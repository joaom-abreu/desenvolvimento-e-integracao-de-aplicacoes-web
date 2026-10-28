import { useEffect, useState } from "react";

/**
 * Debounce: devolve o valor só depois que ele para de mudar por "delay" ms.
 *
 * Sem debounce, digitar "Afonso Pena" faria 11 requisições (uma por tecla).
 * Com debounce de 600 ms, faz uma só, quando você para de digitar.
 *
 *   const [texto, setTexto] = useState("");
 *   const textoParado = useDebouncedValue(texto, 600);
 *   useEffect(() => { buscar(textoParado) }, [textoParado]);
 */
export default function useDebouncedValue(value, delay) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    // Se o valor mudar antes do tempo, o timer antigo é cancelado aqui
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
