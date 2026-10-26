import "./GraficoBarras.scss";

const ALTURA = 240;
const MARGEM = { topo: 24, direita: 8, base: 30, esquerda: 36 };

/** Arredonda o topo do eixo para um número "bonito" (5, 10, 20, 50...). */
export function topoDoEixo(maior) {
  if (maior <= 0) return 1;
  const potencia = 10 ** Math.floor(Math.log10(maior));
  const passo = [1, 2, 5, 10].map((m) => m * potencia).find((p) => p >= maior) ?? 10 * potencia;
  return Math.max(passo, maior);
}

/**
 * Gráfico de barras em SVG puro (o PDF prefere não usar bibliotecas de componentes).
 * Para quem usa leitor de tela, os mesmos dados ficam numa tabela escondida.
 *
 * - destacar(rotulo): pinta a barra de laranja (ex.: o palpite mais comum)
 * - referencia: { rotulo, texto } desenha uma linha vertical antes da barra (ex.: o limite de 7)
 * - largura: largura do desenho (viewBox). Gráfico largo = número maior, para o texto não crescer junto.
 */
export default function GraficoBarras({ titulo, descricao, dados = [], destacar, referencia, unidade = "partidas", largura = 480 }) {
  const LARGURA = largura;
  const maior = Math.max(0, ...dados.map((d) => d.valor));
  const topo = topoDoEixo(maior);
  const areaL = LARGURA - MARGEM.esquerda - MARGEM.direita;
  const areaA = ALTURA - MARGEM.topo - MARGEM.base;
  const passo = dados.length ? areaL / dados.length : areaL;
  const larguraBarra = Math.max(4, passo * 0.68);
  const y = (v) => MARGEM.topo + areaA - (v / topo) * areaA;
  const indiceReferencia = referencia ? dados.findIndex((d) => d.rotulo === referencia.rotulo) : -1;
  const xReferencia = MARGEM.esquerda + (indiceReferencia + 1) * passo;

  return (
    <figure className="grafico">
      <figcaption>
        <strong>{titulo}</strong>
        {descricao && <span className="apoio">{descricao}</span>}
      </figcaption>

      {maior === 0 ? (
        <p className="vazio">Sem dados ainda. Jogue uma rodada.</p>
      ) : (
        <svg viewBox={`0 0 ${LARGURA} ${ALTURA}`} role="img" aria-label={titulo} preserveAspectRatio="xMidYMid meet">
          {[0, 0.5, 1].map((f) => (
            <g key={f} className="grafico-grade">
              <line x1={MARGEM.esquerda} x2={LARGURA - MARGEM.direita} y1={y(topo * f)} y2={y(topo * f)} />
              <text x={MARGEM.esquerda - 8} y={y(topo * f)} dy="0.32em" textAnchor="end">
                {Math.round(topo * f)}
              </text>
            </g>
          ))}

          {dados.map((d, i) => {
            const x = MARGEM.esquerda + i * passo + (passo - larguraBarra) / 2;
            const topoBarra = y(d.valor);
            return (
              <g key={d.rotulo} className="grafico-barra" data-destaque={destacar?.(d.rotulo) || undefined}>
                <rect x={x} y={topoBarra} width={larguraBarra} height={Math.max(0, y(0) - topoBarra)} rx={Math.min(6, larguraBarra / 2)} />
                {d.valor > 0 && (
                  <text className="grafico-valor" x={x + larguraBarra / 2} y={topoBarra - 6} textAnchor="middle">
                    {d.valor}
                  </text>
                )}
                <text className="grafico-rotulo" x={x + larguraBarra / 2} y={ALTURA - 10} textAnchor="middle">
                  {d.rotulo}
                </text>
              </g>
            );
          })}

          {indiceReferencia >= 0 && (
            <g className="grafico-referencia">
              <line x1={xReferencia} x2={xReferencia} y1={MARGEM.topo - 14} y2={y(0)} />
              <text x={xReferencia + 6} y={MARGEM.topo - 6}>
                {referencia.texto}
              </text>
            </g>
          )}
        </svg>
      )}

      <table className="somente-leitor">
        <caption>{titulo}</caption>
        <thead>
          <tr>
            <th scope="col">Item</th>
            <th scope="col">{unidade}</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((d) => (
            <tr key={d.rotulo}>
              <th scope="row">{d.rotulo}</th>
              <td>{d.valor}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
