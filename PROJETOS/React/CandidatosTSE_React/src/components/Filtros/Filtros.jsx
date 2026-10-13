import { useEffect, useState } from "react";
import "./Filtros.css";

/**
 * Formulário de filtro: busca por nome/número, cargo e partido.
 * Os campos só valem quando a pessoa clica em "Filtrar", como no GET do Spring.
 */
function Filtros({ filtros, cargos, partidos, onFiltrar, onLimpar }) {
  const [form, setForm] = useState(filtros);

  // mantém o filtro marcado na tela (inclusive ao usar o "voltar" do navegador)
  useEffect(() => {
    setForm(filtros);
  }, [filtros]);

  const alterar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const enviar = (e) => {
    e.preventDefault();
    onFiltrar(form);
  };

  const limpar = (e) => {
    e.preventDefault();
    onLimpar();
  };

  return (
    <form method="get" action="/" className="filtros" onSubmit={enviar}>
      <div className="campo">
        <label htmlFor="texto">Buscar por nome / número</label>
        <input
          type="text"
          id="texto"
          name="texto"
          value={form.texto}
          onChange={alterar}
          placeholder="Ex: Ana, 1240..."
        />
      </div>

      <div className="campo">
        <label htmlFor="cargo">Cargo</label>
        <select id="cargo" name="cargo" value={form.cargo} onChange={alterar}>
          <option value="">Todos</option>
          {cargos.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="campo">
        <label htmlFor="partido">Partido</label>
        <select id="partido" name="partido" value={form.partido} onChange={alterar}>
          <option value="">Todos</option>
          {partidos.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="campo botoes">
        <button type="submit">Filtrar</button>
        <a href="/" className="limpar" onClick={limpar}>
          Limpar
        </a>
      </div>
    </form>
  );
}

export default Filtros;
