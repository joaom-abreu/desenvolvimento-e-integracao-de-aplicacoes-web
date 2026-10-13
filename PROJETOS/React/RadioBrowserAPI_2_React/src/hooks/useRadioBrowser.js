import { useEffect, useState } from "react";
import {
  listCountries,
  listRadioStations,
  listStates,
} from "../services/radioBrowserApiService";

/** Países e estados: carregados uma vez, independentes do filtro escolhido. */
export function usePaisesEEstados() {
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);

  useEffect(() => {
    let ativo = true;
    Promise.all([listCountries(), listStates()]).then(([c, s]) => {
      if (!ativo) return;
      setCountries(c);
      setStates(s);
    });
    return () => {
      ativo = false;
    };
  }, []);

  return { countries, states };
}

/** Estações do país/estado escolhido: busca de novo sempre que o filtro muda. */
export function useEstacoes(country, state) {
  const [stations, setStations] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let ativo = true; // ignora respostas antigas se o filtro mudar no meio da busca
    setCarregando(true);
    setErro(null);

    listRadioStations(country, state)
      .then((lista) => ativo && setStations(lista))
      .catch((e) => {
        if (!ativo) return;
        setStations([]);
        setErro(e.message);
      })
      .finally(() => ativo && setCarregando(false));

    return () => {
      ativo = false;
    };
  }, [country, state]);

  return { stations, carregando, erro };
}
