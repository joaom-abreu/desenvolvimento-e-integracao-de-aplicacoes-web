import { RESULTADOS } from "../../utils/rotulos.js";
import "./Tabuleiro.scss";

/**
 * Situação de cada número do tabuleiro:
 * - "maior" / "menor" / "acertou": o jogador já chutou esse número;
 * - "revelado": era a resposta de uma partida abandonada;
 * - "possivel": ainda pode ser o número sorteado;
 * - "descartado": as respostas do juiz já o eliminaram.
 */
export function situacaoDoNumero(numero, { palpites = [], possivel, revelado }) {
  const palpite = palpites.find((p) => p.numero === numero);
  if (palpite) return palpite.resultado.toLowerCase();
  if (revelado === numero) return "revelado";
  if (!possivel || (numero >= possivel.minimo && numero <= possivel.maximo)) return "possivel";
  return "descartado";
}

/**
 * O tabuleiro de 1 a 100 sobre o azul dti: o "espaço" onde o número está escondido.
 * A cada resposta, o lado errado apaga. Clicar num número preenche o campo de palpite.
 *
 * Acessibilidade: a grade é um atalho para o mouse. O mesmo conteúdo chega ao leitor de
 * tela pelo resumo da faixa (logo acima) e pelo histórico de palpites, então os 100 botões
 * ficam fora da ordem do Tab (tabIndex -1) para não obrigar ninguém a passar por eles.
 */
export default function Tabuleiro({
  minimo = 1,
  maximo = 100,
  palpites = [],
  possivel = null,
  revelado = null,
  onEscolher,
  ativo = false,
}) {
  const numeros = Array.from({ length: maximo - minimo + 1 }, (_, i) => minimo + i);
  const ultimo = palpites.at(-1)?.numero;
  const faixa = possivel ?? { minimo, maximo };
  const total = maximo - minimo + 1;
  const inicio = ((faixa.minimo - minimo) / total) * 100;
  const largura = ((faixa.maximo - faixa.minimo + 1) / total) * 100;
  const tamanhoFaixa = faixa.maximo - faixa.minimo + 1;

  return (
    <div className="tabuleiro" data-ativo={ativo}>
      <div className="tabuleiro-faixa">
        <p className="tabuleiro-faixa-texto" aria-live="polite">
          {tamanhoFaixa === 1 ? (
            <>
              O número é <strong>{faixa.minimo}</strong>
            </>
          ) : (
            <>
              O número está entre <strong>{faixa.minimo}</strong> e <strong>{faixa.maximo}</strong>
              <span className="tabuleiro-faixa-total"> ({tamanhoFaixa} possíveis)</span>
            </>
          )}
        </p>
        <div className="tabuleiro-trilho" aria-hidden="true">
          <span className="tabuleiro-trilho-faixa" style={{ left: `${inicio}%`, width: `${largura}%` }} />
        </div>
      </div>

      <div className="tabuleiro-grade" role="group" aria-label={`Números de ${minimo} a ${maximo}`}>
        {numeros.map((n) => {
          const situacao = situacaoDoNumero(n, { palpites, possivel, revelado });
          const clicavel = ativo && onEscolher && situacao === "possivel";
          const resultado = RESULTADOS[situacao.toUpperCase()];
          return (
            <button
              key={n}
              type="button"
              tabIndex={-1}
              className="casa"
              data-situacao={situacao}
              data-ultimo={n === ultimo || undefined}
              disabled={!clicavel}
              onClick={clicavel ? () => onEscolher(n) : undefined}
              aria-label={resultado ? `${n}: ${resultado.rotulo.toLowerCase()}` : `${n}: ${situacao}`}
            >
              {n}
              {resultado && (
                <span className="casa-seta" aria-hidden="true">
                  {resultado.seta}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <ul className="tabuleiro-legenda" aria-label="Legenda">
        <li data-situacao="maior">Maior que o sorteado</li>
        <li data-situacao="menor">Menor que o sorteado</li>
        <li data-situacao="possivel">Ainda possível</li>
        <li data-situacao="descartado">Descartado</li>
      </ul>
    </div>
  );
}
