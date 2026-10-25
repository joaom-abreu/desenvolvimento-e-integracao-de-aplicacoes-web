import { useRef } from "react";
import { corEstado, rotuloEstado } from "../../utils/rotulos.js";
import "./MapaAereo.css";

const NA_BASE = new Set(["IDLE", "CARREGANDO", "RECARREGANDO"]);
const COR_PRIORIDADE = { ALTA: "var(--laranja)", MEDIA: "#9ea4ff", BAIXA: "#c9cbe0" };

/**
 * O espaço aéreo da cidade desenhado em SVG.
 * Coordenadas em km. No SVG o eixo y cresce para baixo, então invertemos: yTela = altura - y.
 */
export default function MapaAereo({
  largura = 20,
  altura = 20,
  base = { x: 10, y: 10 },
  zonas = [],
  pedidos = [],
  viagens = [],
  previas = [],
  drones = [],
  destaque = null,
  ponto = null,
  onEscolherPonto,
  rotulo = "Mapa aéreo da cidade",
}) {
  const svgRef = useRef(null);
  const ty = (y) => altura - y;
  const interativo = typeof onEscolherPonto === "function";

  function aoClicar(evento) {
    if (!interativo || !svgRef.current?.getScreenCTM) return;
    const svg = svgRef.current;
    const p = svg.createSVGPoint();
    p.x = evento.clientX;
    p.y = evento.clientY;
    const local = p.matrixTransform(svg.getScreenCTM().inverse());
    const x = Math.round(Math.min(largura, Math.max(0, local.x)) * 10) / 10;
    const y = Math.round(Math.min(altura, Math.max(0, altura - local.y)) * 10) / 10;
    onEscolherPonto(x, y);
  }

  const linhas = [];
  for (let i = 0; i <= Math.max(largura, altura); i++) {
    const forte = i % 5 === 0;
    if (i <= largura) {
      linhas.push(<line key={`v${i}`} x1={i} y1={0} x2={i} y2={altura} className={forte ? "grade-forte" : "grade"} />);
    }
    if (i <= altura) {
      linhas.push(<line key={`h${i}`} x1={0} y1={i} x2={largura} y2={i} className={forte ? "grade-forte" : "grade"} />);
    }
  }

  const caminho = (pontos) => pontos.map((p) => `${p.x},${ty(p.y)}`).join(" ");

  return (
    <div className={`mapa-aereo${interativo ? " mapa-interativo" : ""}`}>
      <svg
        ref={svgRef}
        viewBox={`-1.1 -0.7 ${largura + 1.8} ${altura + 1.8}`}
        role="img"
        aria-label={`${rotulo}: ${drones.length} drones, ${pedidos.length} pedidos e ${zonas.length} zonas de exclusão.`}
        onClick={aoClicar}
      >
        <rect x={0} y={0} width={largura} height={altura} className="mapa-fundo" rx={0.3} />
        {linhas}

        {[0, 5, 10, 15, 20].filter((v) => v <= largura).map((v) => (
          <text key={`ex${v}`} x={v} y={altura + 0.75} className="eixo" textAnchor="middle">
            {v}
          </text>
        ))}
        {[0, 5, 10, 15, 20].filter((v) => v <= altura).map((v) => (
          <text key={`ey${v}`} x={-0.35} y={ty(v) + 0.2} className="eixo" textAnchor="end">
            {v}
          </text>
        ))}

        {zonas.map((z) => (
          <g key={z.id ?? z.nome} className="zona">
            <rect x={z.xMin} y={ty(z.yMax)} width={z.xMax - z.xMin} height={z.yMax - z.yMin} />
            <text x={(z.xMin + z.xMax) / 2} y={ty((z.yMin + z.yMax) / 2) + 0.18} textAnchor="middle">
              {z.nome}
            </text>
          </g>
        ))}

        {previas.map((v, i) => (
          <polyline
            key={`p${i}`}
            points={caminho(v.caminho)}
            className={`rota-previa${destaque === `p${i}` ? " rota-destaque" : ""}`}
          />
        ))}

        {viagens.map((v) => (
          <polyline
            key={v.id}
            points={caminho(v.caminho)}
            className={`rota-ativa${destaque === v.id ? " rota-destaque" : ""}`}
          />
        ))}

        {pedidos.map((p) => (
          <circle
            key={p.id}
            cx={p.x}
            cy={ty(p.y)}
            r={p.status === "ENTREGUE" ? 0.14 : 0.22}
            className={`pedido pedido-${p.status?.toLowerCase()}`}
            style={{ fill: p.status === "ENTREGUE" ? undefined : COR_PRIORIDADE[p.prioridade] }}
          >
            <title>{`${p.cliente ?? "Pedido"} · ${p.pesoKg ?? ""} kg · ${p.prioridade}`}</title>
          </circle>
        ))}

        <g className="base" transform={`translate(${base.x} ${ty(base.y)})`}>
          <circle r={0.75} className="base-anel" />
          <circle r={0.38} className="base-centro" />
          <text y={1.35} textAnchor="middle">base</text>
        </g>

        {drones.map((d) => (
          <g
            key={d.id}
            className="drone"
            data-estado={d.estado}
            style={{ transform: `translate(${d.x}px, ${ty(d.y)}px)` }}
          >
            <title>{`${d.nome}: ${rotuloEstado(d.estado)}`}</title>
            <circle r={0.46} style={{ fill: corEstado(d.estado) }} />
            {/* na base os drones ficam um em cima do outro: o nome só aparece fora dela */}
            {!NA_BASE.has(d.estado) && (
              <text y={-0.75} textAnchor="middle">
                {d.nome}
              </text>
            )}
          </g>
        ))}

        {ponto && (
          <g className="ponto-escolhido" transform={`translate(${ponto.x} ${ty(ponto.y)})`}>
            <circle r={0.5} />
            <line x1={-0.8} y1={0} x2={0.8} y2={0} />
            <line x1={0} y1={-0.8} x2={0} y2={0.8} />
          </g>
        )}
      </svg>
    </div>
  );
}

export function LegendaMapa() {
  return (
    <ul className="legenda-mapa" aria-label="Legenda do mapa">
      <li><span className="amostra amostra-base" />Base</li>
      <li><span className="amostra amostra-rota" />Rota no ar</li>
      <li><span className="amostra amostra-previa" />Próximas viagens</li>
      <li><span className="amostra amostra-zona" />Zona de exclusão</li>
      <li><span className="amostra amostra-alta" />Pedido alta</li>
      <li><span className="amostra amostra-media" />Média</li>
      <li><span className="amostra amostra-baixa" />Baixa</li>
    </ul>
  );
}
