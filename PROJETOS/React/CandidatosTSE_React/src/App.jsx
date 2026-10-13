import { useMemo } from "react";
import CardCandidato from "./components/CardCandidato/CardCandidato";
import Filtros from "./components/Filtros/Filtros";
import useCandidatos from "./hooks/useCandidatos";
import useFiltrosDaUrl from "./hooks/useFiltrosDaUrl";
import { filtrar, listarCargos, listarPartidos } from "./services/candidatosTseService";
import "./App.css";

const NOMES_FILTROS = ["cargo", "partido", "texto"];

/**
 * Tela única com filtros (cargo, partido e busca por texto).
 * Faz o papel do CandidatosTseController + index.html do projeto Spring Boot.
 */
function App() {
  const { carregando, erro } = useCandidatos();
  const { filtros, aplicarFiltros, limparFiltros } = useFiltrosDaUrl(NOMES_FILTROS);

  // opções para os <select> dos filtros
  const cargos = useMemo(() => (carregando ? [] : listarCargos()), [carregando]);
  const partidos = useMemo(() => (carregando ? [] : listarPartidos()), [carregando]);

  const candidatos = useMemo(
    () => (carregando ? [] : filtrar(filtros.cargo, filtros.partido, filtros.texto)),
    [carregando, filtros]
  );

  return (
    <>
      <header className="topo">
        <h1>Candidatos - Eleições 2026 - MG</h1>
      </header>

      <main className="container">
        <Filtros
          filtros={filtros}
          cargos={cargos}
          partidos={partidos}
          onFiltrar={aplicarFiltros}
          onLimpar={limparFiltros}
        />

        {carregando && <p className="resultado-info">Carregando candidatos...</p>}

        {erro && <p className="sem-resultado">{erro}</p>}

        {!carregando && !erro && (
          <>
            <p className="resultado-info">
              <span>{candidatos.length}</span> candidato(s) encontrado(s).
            </p>

            <div className="grade-candidatos">
              {candidatos.map((cand) => (
                <CardCandidato key={cand.sqCandidato} candidato={cand} />
              ))}
            </div>

            {candidatos.length === 0 && (
              <p className="sem-resultado">Nenhum candidato encontrado com esses filtros.</p>
            )}
          </>
        )}
      </main>
    </>
  );
}

export default App;
