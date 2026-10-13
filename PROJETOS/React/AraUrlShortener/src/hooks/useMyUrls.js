import { useCallback, useEffect, useState } from "react";
import { supabaseConfigurado } from "../config/supabaseClient";
import { deleteMyUrl, listMyUrls } from "../services/urlService";

/**
 * Histórico dos links criados neste navegador.
 * - carrega a lista ao abrir a tela (uma única chamada: list_my_urls);
 * - adicionar(url) coloca o link novo no topo, sem ir ao banco;
 * - recarregar() busca de novo (para ver os cliques atualizados);
 * - excluir(shortUrl) apaga no banco e tira da lista.
 */
export default function useMyUrls() {
  const [urls, setUrls] = useState([]);
  const [carregando, setCarregando] = useState(supabaseConfigurado);
  const [excluindo, setExcluindo] = useState(null); // shortUrl aguardando o banco
  const [erro, setErro] = useState(null);

  const recarregar = useCallback(async () => {
    if (!supabaseConfigurado) return;
    setCarregando(true);
    try {
      setUrls(await listMyUrls());
      setErro(null);
    } catch (e) {
      setErro(`Não foi possível carregar o histórico. ${e.message}`);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    if (!supabaseConfigurado) return;
    let ativo = true;

    listMyUrls()
      .then((lista) => ativo && setUrls(lista))
      .catch((e) => ativo && setErro(`Não foi possível carregar o histórico. ${e.message}`))
      .finally(() => ativo && setCarregando(false));

    return () => {
      ativo = false;
    };
  }, []);

  const adicionar = useCallback((url) => {
    setUrls((atual) => [url, ...atual.filter((u) => u.shortUrl !== url.shortUrl)]);
  }, []);

  const excluir = useCallback(async (shortUrl) => {
    setExcluindo(shortUrl);
    try {
      await deleteMyUrl(shortUrl);
      setUrls((atual) => atual.filter((u) => u.shortUrl !== shortUrl));
      setErro(null);
    } catch (e) {
      setErro(`Não foi possível excluir o link. ${e.message}`);
    } finally {
      setExcluindo(null);
    }
  }, []);

  return { urls, carregando, excluindo, erro, recarregar, adicionar, excluir };
}
