export default function Kpi({ valor, rotulo, destaque = false }) {
  return (
    <div className={`kpi${destaque ? " kpi-destaque" : ""}`}>
      <div className="kpi-valor">{valor}</div>
      <div className="kpi-rotulo">{rotulo}</div>
    </div>
  );
}
