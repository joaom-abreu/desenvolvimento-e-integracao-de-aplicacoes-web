import { Link } from "react-router-dom";
import { LuHourglass, LuScissors, LuUnlink2 } from "react-icons/lu";
import PageLayout from "../PageLayout/PageLayout";
import "./LinkError.css";

const TIPOS = {
  "nao-encontrado": {
    codigo: "404",
    icone: LuUnlink2,
    titulo: "Link não encontrado",
    descricao: "Esse link curto não existe ou foi excluído. Confira se foi digitado certinho.",
  },
  expirado: {
    codigo: "410",
    icone: LuHourglass,
    titulo: "Link expirado",
    descricao: "Esse link curto tinha data de validade e não redireciona mais.",
  },
  erro: {
    codigo: "Ops",
    icone: LuUnlink2,
    titulo: "Não foi possível abrir o link",
    descricao: "Algo deu errado ao consultar o link. Tente de novo em instantes.",
  },
};

/**
 * Tela de erro do redirecionamento (o GlobalExceptionHandler do Spring):
 * 404 (UrlNotFoundException), 410 (UrlExpiredException) ou erro genérico.
 */
function LinkError({ tipo = "nao-encontrado", shortUrl, detalhe }) {
  const { codigo, icone: Icone, titulo, descricao } = TIPOS[tipo] ?? TIPOS.erro;

  return (
    <PageLayout label={`ERRO ${codigo}`} title={titulo} description={descricao}>
      <title>{`${titulo} | AraUrl`}</title>

      <div className="link-error">
        <span className="link-error-icon" aria-hidden="true">
          <Icone />
        </span>

        {shortUrl && <code className="link-error-code">/{shortUrl}</code>}
        {detalhe && <p className="link-error-detail">{detalhe}</p>}

        <Link to="/" className="btn btn-primary">
          <LuScissors aria-hidden="true" />
          <span>Encurtar uma URL</span>
        </Link>
      </div>
    </PageLayout>
  );
}

export default LinkError;
