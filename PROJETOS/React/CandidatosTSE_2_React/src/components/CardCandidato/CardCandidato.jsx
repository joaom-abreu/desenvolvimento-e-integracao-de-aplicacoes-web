import { urlFoto } from "../../services/candidatosTseService";
import "./CardCandidato.css";

/** O TSE usa "#NULO" e "#NE" quando o campo não foi informado. */
const informado = (valor) => valor && valor.trim() !== "" && valor !== "#NULO" && valor !== "#NE";

/** Cor da etiqueta de gênero. */
const classeGenero = (genero) => {
  if (genero === "FEMININO") return "etiqueta-f";
  if (genero === "MASCULINO") return "etiqueta-m";
  return "";
};

/** Card horizontal: foto à esquerda, dados à direita. */
function CardCandidato({ candidato: cand }) {
  const foto = urlFoto(cand);

  return (
    <article className="card-candidato">
      {foto ? (
        <img src={foto} alt={cand.nomeUrna} loading="lazy" className="foto-candidato" />
      ) : (
        <div className="foto-candidato foto-vazia">Sem foto</div>
      )}

      <div className="card-info">
        <div className="card-titulo">
          <h2>{cand.nomeUrna}</h2>
          <span className="numero">{cand.nrCandidato}</span>
        </div>

        <p className="cargo-partido">
          {cand.cargo} · {cand.siglaPartido}
        </p>

        <div className="etiquetas">
          {informado(cand.genero) && (
            <span className={`etiqueta ${classeGenero(cand.genero)}`.trim()}>{cand.genero}</span>
          )}
          {cand.idade > 0 && <span className="etiqueta etiqueta-idade">{cand.idade} anos</span>}
        </div>

        {informado(cand.grauInstrucao) && <p className="extra">{cand.grauInstrucao}</p>}
        {informado(cand.ocupacao) && <p className="extra">{cand.ocupacao}</p>}
      </div>
    </article>
  );
}

export default CardCandidato;
