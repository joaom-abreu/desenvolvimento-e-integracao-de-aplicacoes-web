import "./TunerHeader.css";

/** Cabeçalho: painel do sintonizador com o nome, o "Ao vivo" e o trilho do dial. */
function TunerHeader() {
  return (
    <header className="tuner-header">
      <div className="tuner-brand">
        <div>
          <h1>📻 AraDio</h1>
          <p className="tagline">Sintonize estações de rádio de todo o Brasil</p>
        </div>
        <span className="on-air">
          <span className="dot"></span>Ao vivo
        </span>
      </div>
      <div className="dial-ticks"></div>
    </header>
  );
}

export default TunerHeader;
