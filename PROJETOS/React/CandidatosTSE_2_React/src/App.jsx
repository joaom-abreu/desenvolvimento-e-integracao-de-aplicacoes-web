import { useMemo } from "react";
import CardCandidato from "./components/CardCandidato/CardCandidato";
import PainelFiltros from "./components/PainelFiltros/PainelFiltros";
import useCandidatos from "./hooks/useCandidatos";
import useFiltrosDaUrl from "./hooks/useFiltrosDaUrl";
import { filtrarPerfil, listarEscolaridades, listarGeneros } from "./services/candidatosTseService";
import "./App.css";

const NOMES_FILTROS = ["genero", "escolaridade", "idadeMin", "idadeMax"];

/** "30" → 30; vazio ou inválido → null (o Integer opcional do @RequestParam). */
const paraInteiro = (texto) => {
  const numero = Number.parseInt(texto, 10);
  return Number.isNaN(numero) ? null : numero;
};

/**
 * Tela única com filtros por perfil (gênero, escolaridade e faixa etária).
 * Faz o papel do CandidatosTseController + index.html do projeto Spring Boot.
 */
function App() {
  const { carregando, erro } = useCandidatos();
  const { filtros, aplicarFiltros, limparFiltros } = useFiltrosDaUrl(NOMES_FILTROS);

  // opções para os filtros (botões de opção de gênero e <select> de escolaridade)
  const generos = useMemo(() => (carregando ? [] : listarGeneros()), [carregando]);
  const escolaridades = useMemo(() => (carregando ? [] : listarEscolaridades()), [carregando]);

  const candidatos = useMemo(
    () =>
      carregando
        ? []
        : filtrarPerfil(
            filtros.genero,
            filtros.escolaridade,
            paraInteiro(filtros.idadeMin),
            paraInteiro(filtros.idadeMax)
          ),
    [carregando, filtros]
  );

  return (
    <>
      <header className="topo">
        <h1>Perfil dos Candidatos - Eleições 2026 - MG</h1>
        <p className="subtitulo">Filtre por gênero, escolaridade e faixa etária</p>
      </header>

      <div className="layout">
        <PainelFiltros
          filtros={filtros}
          generos={generos}
          escolaridades={escolaridades}
          onFiltrar={aplicarFiltros}
          onLimpar={limparFiltros}
        />

        <main className="conteudo">
          {carregando && <p className="resultado-info">Carregando candidatos...</p>}

          {erro && <p className="sem-resultado">{erro}</p>}

          {!carregando && !erro && (
            <>
              <p className="resultado-info">
                <strong>{candidatos.length}</strong> candidato(s) encontrado(s).
              </p>

              <div className="lista-candidatos">
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
      </div>
    </>
  );
}

export default App;
