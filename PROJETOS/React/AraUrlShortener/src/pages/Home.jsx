import { useCallback, useState } from "react";
import { LuTriangleAlert } from "react-icons/lu";
import PageLayout from "../components/PageLayout/PageLayout";
import ShortenForm from "../components/ShortenForm/ShortenForm";
import ShortUrlResult from "../components/ShortUrlResult/ShortUrlResult";
import UrlHistory from "../components/UrlHistory/UrlHistory";
import { supabaseConfigurado } from "../config/supabaseClient";
import useMyUrls from "../hooks/useMyUrls";

/**
 * Página Home: caixa para colar a URL, o link criado e o histórico.
 * Faz o papel do POST /api/shorten do UrlController do Spring.
 */
function Home() {
  const historico = useMyUrls();
  const { adicionar } = historico;
  const [ultimo, setUltimo] = useState(null);

  const aoCriar = useCallback(
    (url) => {
      setUltimo(url);
      adicionar(url);
    },
    [adicionar]
  );

  return (
    <PageLayout
      title="Encurte seus links"
      description="Cole uma URL longa e receba um link curto do AraUrl, pronto para compartilhar. Escolha um alias, defina uma validade e acompanhe os cliques."
    >
      <title>AraUrl - Encurtador de URL</title>

      {!supabaseConfigurado && (
        <p className="form-message warning" role="status">
          <LuTriangleAlert aria-hidden="true" />
          <span>
            Supabase não configurado: preencha <code>VITE_SUPABASE_URL</code> e{" "}
            <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> no <code>.env.local</code> e reinicie o{" "}
            <code>npm run dev</code> (veja o README).
          </span>
        </p>
      )}

      <ShortenForm onCreated={aoCriar} disabled={!supabaseConfigurado} />

      {ultimo && <ShortUrlResult url={ultimo} onClose={() => setUltimo(null)} />}

      <UrlHistory
        urls={historico.urls}
        carregando={historico.carregando}
        excluindo={historico.excluindo}
        erro={historico.erro}
        habilitado={supabaseConfigurado}
        onRefresh={historico.recarregar}
        onDelete={historico.excluir}
      />
    </PageLayout>
  );
}

export default Home;
