import { useCallback, useEffect, useState } from "react";
import { supabaseConfigurado } from "../config/supabaseClient";
import { getFavoriteUuids, toggle } from "../services/favoriteService";

/**
 * Favoritos guardados no Supabase.
 * - carrega todos os UUIDs numa única consulta ao abrir a tela;
 * - alternarFavorito(uuid) grava no banco e atualiza a tela.
 */
export default function useFavoritos() {
  const [favoriteUuids, setFavoriteUuids] = useState(() => new Set());
  const [salvando, setSalvando] = useState(() => new Set()); // estrelas aguardando o banco
  const [erro, setErro] = useState(
    supabaseConfigurado
      ? null
      : "Favoritos desativados: preencha VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY no .env.local."
  );

  useEffect(() => {
    if (!supabaseConfigurado) return;
    let ativo = true;

    getFavoriteUuids()
      .then((uuids) => ativo && setFavoriteUuids(uuids))
      .catch((e) => ativo && setErro(`Não foi possível carregar os favoritos. ${e.message}`));

    return () => {
      ativo = false;
    };
  }, []);

  const alternarFavorito = useCallback(async (stationUuid) => {
    setSalvando((atual) => new Set(atual).add(stationUuid));
    try {
      const agoraEFavorita = await toggle(stationUuid);
      setFavoriteUuids((atual) => {
        const novo = new Set(atual);
        if (agoraEFavorita) novo.add(stationUuid);
        else novo.delete(stationUuid);
        return novo;
      });
      setErro(null);
    } catch (e) {
      setErro(`Não foi possível salvar o favorito. ${e.message}`);
    } finally {
      setSalvando((atual) => {
        const novo = new Set(atual);
        novo.delete(stationUuid);
        return novo;
      });
    }
  }, []);

  return {
    favoriteUuids,
    salvando,
    erro,
    habilitado: supabaseConfigurado,
    alternarFavorito,
  };
}
