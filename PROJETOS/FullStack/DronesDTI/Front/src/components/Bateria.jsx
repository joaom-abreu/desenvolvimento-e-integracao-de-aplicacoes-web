/** Barra de bateria: verde acima de 50%, âmbar até 25%, vermelha abaixo. */
export default function Bateria({ valor }) {
  const nivel = valor > 50 ? "alta" : valor > 25 ? "media" : "baixa";
  const arredondado = Math.round(valor);
  return (
    <div className="bateria" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={arredondado} aria-label="Bateria">
      <div className="bateria-trilho">
        <div className="bateria-nivel" data-nivel={nivel} style={{ width: `${Math.max(0, Math.min(100, valor))}%` }} />
      </div>
      <span>{arredondado}%</span>
    </div>
  );
}
