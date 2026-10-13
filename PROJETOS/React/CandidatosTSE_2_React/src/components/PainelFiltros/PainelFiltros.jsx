import { useEffect, useState } from "react";
import "./PainelFiltros.css";

/**
 * Painel lateral de filtros: gênero (botões de opção), escolaridade (lista)
 * e faixa etária (idade mínima e máxima).
 * Os campos só valem quando a pessoa clica em "Filtrar", como no GET do Spring.
 */
function PainelFiltros({ filtros, generos, escolaridades, onFiltrar, onLimpar }) {
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
    <aside className="painel-filtros">
      <form method="get" action="/" onSubmit={enviar}>
        <fieldset className="grupo">
          <legend>Gênero</legend>
          <label className="opcao">
            <input
              type="radio"
              name="genero"
              value=""
              checked={form.genero === ""}
              onChange={alterar}
            />
            Todos
          </label>
          {generos.map((g) => (
            <label className="opcao" key={g}>
              <input
                type="radio"
                name="genero"
                value={g}
                checked={form.genero === g}
                onChange={alterar}
              />
              <span>{g}</span>
            </label>
          ))}
        </fieldset>

        <div className="grupo">
          <label htmlFor="escolaridade">Escolaridade</label>
          <select id="escolaridade" name="escolaridade" value={form.escolaridade} onChange={alterar}>
            <option value="">Todas</option>
            {escolaridades.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
        </div>

        <div className="grupo">
          <span className="rotulo">Faixa etária</span>
          <div className="faixa-idade">
            <input
              type="number"
              name="idadeMin"
              min="18"
              max="100"
              placeholder="De"
              aria-label="Idade mínima"
              value={form.idadeMin}
              onChange={alterar}
            />
            <span>até</span>
            <input
              type="number"
              name="idadeMax"
              min="18"
              max="100"
              placeholder="Até"
              aria-label="Idade máxima"
              value={form.idadeMax}
              onChange={alterar}
            />
          </div>
        </div>

        <div className="botoes">
          <button type="submit">Filtrar</button>
          <a href="/" className="limpar" onClick={limpar}>
            Limpar
          </a>
        </div>
      </form>
    </aside>
  );
}

export default PainelFiltros;
