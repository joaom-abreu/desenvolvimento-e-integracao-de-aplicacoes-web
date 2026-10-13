import { urlFoto } from "../../services/candidatosTseService";
import "./CardCandidato.css";

/** O TSE usa "#NULO" e "#NE" quando o campo não foi informado. */
const informado = (valor) => valor && valor.trim() !== "" && valor !== "#NULO" && valor !== "#NE";

/** Card de um candidato: foto oficial + dados principais. */
function CardCandidato({ candidato: cand }) {
  const foto = urlFoto(cand);

  return (
    <div className="card">
      {foto ? (
        <img src={foto} alt={cand.nomeUrna} loading="lazy" className="foto-candidato" />
      ) : (
        <div className="foto-candidato foto-vazia">Sem foto</div>
      )}

      <div className="card-info">
        <h2>{cand.nomeUrna}</h2>
        <p className="numero">Número: {cand.nrCandidato}</p>
        <p>
          <strong>{cand.cargo}</strong>
        </p>
        <p>
          {cand.siglaPartido} - {cand.nomePartido}
        </p>
        <p className="municipio">{cand.municipio}</p>
        {informado(cand.situacaoCandidatura) && <p className="situacao">{cand.situacaoCandidatura}</p>}

        {cand.idade > 0 && (
          <p className="extra">
            <span>{cand.idade} anos</span>
          </p>
        )}
        {informado(cand.ocupacao) && <p className="extra">{cand.ocupacao}</p>}
        {informado(cand.grauInstrucao) && <p className="extra">{cand.grauInstrucao}</p>}

        <p className="detalhes">{cand.nomeCandidato}</p>
      </div>
    </div>
  );
}

export default CardCandidato;
