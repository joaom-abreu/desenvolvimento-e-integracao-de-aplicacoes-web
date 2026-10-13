import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import LinkError from "../components/LinkError/LinkError";
import { supabaseConfigurado } from "../config/supabaseClient";
import { UrlExpiredException, UrlNotFoundException } from "../core/exceptions";
import { getAndValidateOriginalUrl } from "../services/urlService";
import "./Redirect.css";

/**
 * O StrictMode roda cada efeito DUAS vezes no npm run dev. Sem este cache,
 * cada visita contaria 2 cliques. Guardando a Promise por código, a segunda
 * execução reaproveita a primeira (em produção o efeito roda uma vez só).
 */
const resolucoes = new Map();

function resolverUmaVez(shortUrl) {
  if (!resolucoes.has(shortUrl)) {
    resolucoes.set(shortUrl, getAndValidateOriginalUrl(shortUrl));
  }
  return resolucoes.get(shortUrl);
}

function tipoDoErro(erro) {
  if (erro instanceof UrlExpiredException) return "expirado";
  if (erro instanceof UrlNotFoundException) return "nao-encontrado";
  return "erro";
}

/**
 * Rota /:shortUrl: o antigo GET /api/{shortUrl} do Spring.
 * Lá o servidor respondia 302 + Location. Aqui não há servidor: o React busca
 * a URL original no Supabase e troca de página com window.location.replace
 * (replace = o link curto não fica no histórico do botão "voltar").
 */
function Redirect() {
  const { shortUrl } = useParams();
  const [erro, setErro] = useState(
    supabaseConfigurado ? null : { tipo: "erro", detalhe: "Supabase não configurado." }
  );

  useEffect(() => {
    if (!supabaseConfigurado) return;
    let ativo = true;

    resolverUmaVez(shortUrl)
      .then((originalUrl) => {
        if (ativo) window.location.replace(originalUrl);
      })
      .catch((e) => {
        if (!ativo) return;
        const tipo = tipoDoErro(e);
        setErro({ tipo, detalhe: tipo === "erro" ? e.message : null });
      });

    return () => {
      ativo = false;
    };
  }, [shortUrl]);

  if (erro) {
    return <LinkError tipo={erro.tipo} shortUrl={shortUrl} detalhe={erro.detalhe} />;
  }

  return (
    <div className="redirect-screen" role="status">
      <title>Redirecionando... | AraUrl</title>
      <span className="redirect-logo" aria-hidden="true" />
      <p>Redirecionando...</p>
      <code>/{shortUrl}</code>
    </div>
  );
}

export default Redirect;
