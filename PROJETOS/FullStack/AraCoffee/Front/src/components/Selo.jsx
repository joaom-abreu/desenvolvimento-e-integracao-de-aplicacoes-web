/**
 * Selo redondo da AraCoffee (como o carimbo de um saco de café).
 * É um SVG desenhado aqui mesmo, então usa as fontes da página
 * (Shrikhand no nome e Karla no texto em volta).
 */
const Selo = ({ className = "" }) => (
  <svg className={className} viewBox="0 0 320 320" role="img" aria-labelledby="selo-titulo">
    <title id="selo-titulo">Selo AraCoffee, torrado em Belo Horizonte</title>

    <defs>
      {/* Arco de cima (texto lido da esquerda para a direita, por cima) */}
      <path id="selo-arco-cima" d="M 44 160 A 116 116 0 0 1 276 160" />
      {/* Arco de baixo (texto lido da esquerda para a direita, por baixo) */}
      <path id="selo-arco-baixo" d="M 32 160 A 128 128 0 0 0 288 160" />
    </defs>

    <circle cx="160" cy="160" r="152" fill="#F1E3CF" />
    <circle cx="160" cy="160" r="140" fill="none" stroke="#5B3220" strokeWidth="3" />
    <circle cx="160" cy="160" r="102" fill="none" stroke="#5B3220" strokeWidth="1.5" strokeDasharray="2 6" strokeLinecap="round" />

    <text fill="#5B3220" fontFamily="Karla, sans-serif" fontWeight="700" fontSize="17" letterSpacing="3">
      <textPath href="#selo-arco-cima" startOffset="50%" textAnchor="middle">
        torrado em Belo Horizonte
      </textPath>
    </text>
    <text fill="#5B3220" fontFamily="Karla, sans-serif" fontWeight="700" fontSize="17" letterSpacing="3">
      <textPath href="#selo-arco-baixo" startOffset="50%" textAnchor="middle">
        Coração Eucarístico
      </textPath>
    </text>

    <circle cx="33" cy="160" r="4" fill="#B9783F" />
    <circle cx="287" cy="160" r="4" fill="#B9783F" />

    {/* Grão de café */}
    <g transform="translate(160 112) rotate(28)">
      <ellipse rx="15" ry="21" fill="#5B3220" />
      <path d="M1.5 -19 C -8 -7, 9 5, -1.5 19" fill="none" stroke="#F1E3CF" strokeWidth="3.2" strokeLinecap="round" />
    </g>

    <text x="160" y="182" textAnchor="middle" fill="#5B3220" fontFamily="Shrikhand, Georgia, serif" fontSize="44">
      AraCoffee
    </text>

    <text x="160" y="213" textAnchor="middle" fill="#7A4E33" fontFamily="Karla, sans-serif" fontWeight="700" fontSize="14" letterSpacing="2">
      cafeteria
    </text>
  </svg>
);

export default Selo;
