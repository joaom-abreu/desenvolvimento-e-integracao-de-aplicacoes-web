import { useEffect, useState } from "react";
import { carregarCsv } from "../services/candidatosTseService";

/**
 * Carrega o CSV do TSE uma vez quando a tela abre.
 * Enquanto isso, a tela mostra "Carregando candidatos...".
 */
export default function useCandidatos() {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let ativo = true;

    carregarCsv()
      .then(() => ativo && setErro(null))
      .catch((e) => ativo && setErro(e.message))
      .finally(() => ativo && setCarregando(false));

    // StrictMode monta o componente duas vezes no dev: o carregarCsv()
    // devolve a mesma Promise, então o CSV é baixado uma vez só.
    return () => {
      ativo = false;
    };
  }, []);

  return { carregando, erro };
}
