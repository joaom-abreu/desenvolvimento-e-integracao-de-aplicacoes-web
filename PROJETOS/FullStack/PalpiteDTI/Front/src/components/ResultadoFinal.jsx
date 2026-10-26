import { Link } from "react-router-dom";
import { ClassificacaoSelo } from "./Selos.jsx";
import { formatarDuracao, plural } from "../utils/formatadores.js";

/** Fim de rodada: vitória (com posição no ranking) ou desistência (número revelado). */
export default function ResultadoFinal({ partida, onJogarDeNovo, onTrocarJogador, ocupado }) {
  const venceu = partida.status === "VENCIDA";
  return (
    <section className="resultado-final" aria-labelledby="resultado-titulo">
      <h2 id="resultado-titulo">{venceu ? "Acertou!" : "Rodada encerrada"}</h2>
      <p className="resultado-numero" aria-label={`O número era ${partida.numeroSecreto}`}>
        {partida.numeroSecreto}
      </p>

      {venceu ? (
        <>
          <p>
            {partida.jogador}, você acertou em <strong>{plural(partida.tentativas, "tentativa")}</strong> e{" "}
            {formatarDuracao(partida.duracaoSegundos)}. Jogando sempre no meio, o pior caso é{" "}
            {plural(partida.tentativasIdeais, "tentativa")}.
          </p>
          <p className="acoes">
            <ClassificacaoSelo classificacao={partida.classificacao} />
            {partida.posicaoRanking && (
              <span className="selo">{partida.posicaoRanking}º lugar no ranking</span>
            )}
          </p>
        </>
      ) : (
        <p>Você desistiu depois de {plural(partida.tentativas, "tentativa")}. Este era o número sorteado.</p>
      )}

      <div className="acoes">
        <button className="botao botao-grande" onClick={onJogarDeNovo} disabled={ocupado} autoFocus>
          Jogar de novo
        </button>
        <Link className="botao botao-secundario botao-grande" to="/ranking">
          Ver ranking
        </Link>
      </div>
      <button className="link-simples" type="button" onClick={onTrocarJogador}>
        Trocar de jogador
      </button>
    </section>
  );
}
