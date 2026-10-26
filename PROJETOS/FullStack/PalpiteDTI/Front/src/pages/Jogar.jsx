import { useState } from "react";
import Tabuleiro from "../components/Tabuleiro/Tabuleiro.jsx";
import PalpiteForm from "../components/PalpiteForm.jsx";
import NovaPartidaForm from "../components/NovaPartidaForm.jsx";
import HistoricoPalpites from "../components/HistoricoPalpites.jsx";
import ResultadoFinal from "../components/ResultadoFinal.jsx";
import Mensagem from "../components/Mensagem.jsx";
import Kpi from "../components/Kpi.jsx";
import { useJogo } from "../hooks/JogoContext.jsx";
import { usePartida } from "../hooks/usePartida.js";
import "./Jogar.scss";

/** Tipo da caixa de feedback conforme a resposta do juiz. */
const TIPO_MENSAGEM = { ACERTOU: "sucesso", MAIOR: "info", MENOR: "info" };

/** "/" : a página do jogo. */
export default function Jogar() {
  const { configuracao } = useJogo();
  const { partida, lance, erro, ocupado, restaurando, jogador, iniciar, palpitar, desistir, sair } = usePartida();
  const [escolhido, setEscolhido] = useState(null);

  const emAndamento = partida?.status === "EM_ANDAMENTO";
  const encerrada = partida && !emAndamento;
  const minimo = partida?.intervalo.minimo ?? configuracao.minimo;
  const maximo = partida?.intervalo.maximo ?? configuracao.maximo;

  function escolherNoTabuleiro(numero) {
    setEscolhido((anterior) => ({ numero, vez: (anterior?.vez ?? 0) + 1 }));
  }

  return (
    <div className="pagina">
      <div className="pagina-topo">
        <div>
          <h1>Adivinhe o número</h1>
          <p>
            O servidor sorteia um número inteiro de {minimo} a {maximo}. A cada palpite ele diz se o seu número é maior ou
            menor que o sorteado. Acerte com menos tentativas para subir no ranking.
          </p>
        </div>
      </div>

      <div className="grade-2 jogar">
        <section aria-label="Tabuleiro de números">
          <Tabuleiro
            minimo={minimo}
            maximo={maximo}
            palpites={partida?.palpites ?? []}
            possivel={partida?.possivel ?? null}
            revelado={partida?.status === "ABANDONADA" ? partida.numeroSecreto : null}
            ativo={emAndamento && !ocupado}
            onEscolher={escolherNoTabuleiro}
          />
        </section>

        <div className="jogar-lateral">
          <section className="painel" aria-labelledby="rodada-titulo">
            {restaurando ? (
              <p className="carregando">Retomando sua rodada…</p>
            ) : !partida ? (
              <>
                <h2 id="rodada-titulo">Nova rodada</h2>
                <p className="apoio">
                  Um número novo é sorteado no servidor a cada rodada. Ele só aparece na tela quando a rodada termina.
                </p>
                <NovaPartidaForm nomeInicial={jogador} onIniciar={iniciar} ocupado={ocupado} />
              </>
            ) : encerrada ? (
              <ResultadoFinal
                partida={partida}
                ocupado={ocupado}
                onJogarDeNovo={() => iniciar(jogador).catch(() => {})}
                onTrocarJogador={sair}
              />
            ) : (
              <>
                <h2 id="rodada-titulo">Rodada de {partida.jogador}</h2>
                <div className="kpis jogar-kpis">
                  <Kpi valor={partida.tentativas} rotulo={partida.tentativas === 1 ? "tentativa" : "tentativas"} destaque />
                  <Kpi valor={partida.possivel.tamanho} rotulo="números possíveis" />
                  <Kpi valor={partida.tentativasIdeais} rotulo="no pior caso, jogando no meio" />
                </div>
                <PalpiteForm
                  minimo={minimo}
                  maximo={maximo}
                  jaTentados={partida.palpites.map((p) => p.numero)}
                  onPalpitar={palpitar}
                  ocupado={ocupado}
                  escolhido={escolhido}
                />
                <div className="jogar-feedback" aria-live="polite">
                  {lance && <Mensagem tipo={TIPO_MENSAGEM[lance.palpite.resultado]}>{lance.mensagem}</Mensagem>}
                  {lance?.dica && <Mensagem tipo="aviso">{lance.dica}</Mensagem>}
                </div>
              </>
            )}
            {erro && <Mensagem tipo="erro">{erro.message}</Mensagem>}
          </section>

          {partida && (
            <section className="painel" aria-labelledby="historico-titulo">
              <div className="painel-topo">
                <h2 id="historico-titulo">Palpites</h2>
                {emAndamento && (
                  <button className="botao botao-perigo botao-pequeno" onClick={() => desistir().catch(() => {})} disabled={ocupado}>
                    Desistir e ver o número
                  </button>
                )}
              </div>
              <HistoricoPalpites palpites={partida.palpites} />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
