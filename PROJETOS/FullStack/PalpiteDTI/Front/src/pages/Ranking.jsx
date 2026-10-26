import { Link } from "react-router-dom";
import { usePolling } from "../hooks/usePolling.js";
import { useJogo } from "../hooks/JogoContext.jsx";
import { rankingService } from "../services/api.js";
import { ClassificacaoSelo, RoboSelo } from "../components/Selos.jsx";
import Mensagem from "../components/Mensagem.jsx";
import { formatarDataHora, formatarDuracao } from "../utils/formatadores.js";
import { lerLocal } from "../utils/armazenamento.js";
import { CHAVE_ULTIMA_VITORIA } from "../hooks/usePartida.js";

/** "/ranking": quem acertou com menos tentativas (bônus do PDF), salvo no MongoDB. */
export default function Ranking() {
  const { configuracao } = useJogo();
  const { dados, erro, carregando } = usePolling(() => rankingService.top(configuracao.tamanhoRanking), 5000);
  const minhaUltima = lerLocal(CHAVE_ULTIMA_VITORIA);

  return (
    <div className="pagina">
      <div className="pagina-topo">
        <div>
          <h1>Ranking</h1>
          <p>
            Menos tentativas primeiro. No empate, vence quem acertou mais rápido. Jogando sempre no meio, ninguém precisa
            de mais de {configuracao.tentativasIdeais} tentativas.
          </p>
        </div>
        <Link className="botao" to="/">
          Jogar uma rodada
        </Link>
      </div>

      <section className="painel" aria-labelledby="ranking-titulo">
        <h2 id="ranking-titulo">Top {configuracao.tamanhoRanking}</h2>
        {erro && <Mensagem tipo="erro">{erro.message}</Mensagem>}
        {carregando && !dados ? (
          <p className="carregando">Carregando o ranking…</p>
        ) : dados?.length === 0 ? (
          <p className="vazio">
            <strong>Ninguém acertou ainda</strong>
            Seja a primeira pessoa no ranking.
          </p>
        ) : (
          dados && (
            <div className="tabela-rolagem">
              <table>
                <caption className="somente-leitor">Ranking das partidas vencidas</caption>
                <thead>
                  <tr>
                    <th scope="col" className="numero">Posição</th>
                    <th scope="col">Jogador</th>
                    <th scope="col" className="numero">Tentativas</th>
                    <th scope="col" className="numero">Tempo</th>
                    <th scope="col">Desempenho</th>
                    <th scope="col">Quando</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.map((item) => (
                    <tr key={item.partidaId} data-destaque={item.partidaId === minhaUltima || undefined}>
                      <td className="numero">{item.posicao}º</td>
                      <th scope="row">
                        {item.jogador} {item.robo && <RoboSelo />}
                        {item.partidaId === minhaUltima && <span className="selo selo-acertou">você</span>}
                      </th>
                      <td className="numero">{item.tentativas}</td>
                      <td className="numero">{formatarDuracao(item.duracaoSegundos)}</td>
                      <td>
                        <ClassificacaoSelo classificacao={item.classificacao} />
                      </td>
                      <td>{formatarDataHora(item.finalizadaEm)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </section>
    </div>
  );
}
