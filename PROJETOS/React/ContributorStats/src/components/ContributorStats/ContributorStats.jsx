import { useCallback, useEffect, useState } from "react";
import { FiBarChart2, FiTerminal } from "react-icons/fi";
import CONFIG from "../../config/contributorStatsConfig";
import { defaultCsvFilename, exportToCsv, SortCriterion } from "../../core";
import AnalysisForm from "./AnalysisForm";
import ContributorStatCards from "./ContributorStatCards";
import ExecutionLog from "./ExecutionLog";
import RankingTable from "./RankingTable";
import TopContributorsChart from "./TopContributorsChart";
import useContributorStats from "./useContributorStats";
import "./ContributorStats.css";

/**
 * Painel completo: formulário + indicadores + ranking + gráfico + log.
 * Cada parte também funciona sozinha (ex.: <RankingTable result={...} />).
 *
 * <ContributorStats />
 * <ContributorStats repoUrl="https://github.com/dono/repo" />
 */
export default function ContributorStats({ repoUrl = CONFIG.DEFAULT_REPO_URL }) {
  const stats = useContributorStats();
  const { result, running, start, cancel, resort, addLog, setMessage } = stats;
  const [tab, setTab] = useState("ranking");
  const [form, setForm] = useState({
    url: repoUrl,
    criterion: SortCriterion.COMMITS,
    allBranches: CONFIG.DEFAULT_ALL_BRANCHES,
    includeMerges: CONFIG.DEFAULT_INCLUDE_MERGES,
    fetchExactDates: CONFIG.DEFAULT_EXACT_DATES,
  });

  const handleChange = (next) => {
    // Trocar o critério reordena o resultado atual, sem nova consulta à API
    if (next.criterion !== form.criterion) resort(next.criterion);
    setForm(next);
  };

  const handleSubmit = async () => {
    await start(form);
  };

  // Quando uma análise termina com sucesso: volta para a aba Ranking e aplica o
  // critério atual (caso tenha sido trocado durante a análise)
  const { status } = stats;
  const { criterion } = form;
  useEffect(() => {
    if (status === "done") {
      setTab("ranking");
      resort(criterion);
    }
  }, [status]);

  const handleExport = useCallback(() => {
    if (!result?.contributors.length) return;
    try {
      const file = exportToCsv(result.contributors, defaultCsvFilename(result.repo));
      addLog(`Ranking exportado para ${file}`, "success");
      setMessage(`CSV salvo como ${file}`);
    } catch (error) {
      addLog(`Erro ao exportar: ${error.message}`, "error");
    }
  }, [result, addLog, setMessage]);

  // Atalhos: Esc cancela · Ctrl+E / Cmd+E exporta o CSV
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") cancel();
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "e") {
        event.preventDefault();
        handleExport();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cancel, handleExport]);

  const { progress } = stats;
  const percent = progress ? Math.round((progress.current / progress.total) * 100) : null;

  return (
    <div className="cs">
      <AnalysisForm
        values={form}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={cancel}
        running={running}
        hasToken={stats.hasToken}
      />

      {/* Barra de status + progresso */}
      <div className={`cs-status is-${stats.status}`} role="status">
        <span className="cs-status-text" title={stats.message}>
          {stats.message}
        </span>
        <span
          className={`cs-progress${running && percent === null ? " is-indeterminate" : ""}`}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent ?? undefined}
        >
          <span style={{ width: percent === null ? undefined : `${percent}%` }} />
        </span>
      </div>

      {stats.status === "error" && stats.error && (
        <div className="cs-message" role="alert">
          <strong>Não foi possível analisar o repositório</strong>
          <span>{stats.error.message}</span>
        </div>
      )}

      <ContributorStatCards result={result} />

      <div className="cs-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={tab === "ranking"}
          className={tab === "ranking" ? "is-active" : undefined}
          onClick={() => setTab("ranking")}
        >
          <FiBarChart2 aria-hidden="true" /> Ranking
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "log"}
          className={tab === "log" ? "is-active" : undefined}
          onClick={() => setTab("log")}
        >
          <FiTerminal aria-hidden="true" /> Log de execução
          {stats.log.length > 0 && <span className="cs-badge">{stats.log.length}</span>}
        </button>
      </div>

      {tab === "ranking" ? (
        <div className="cs-sections">
          <RankingTable result={result} onExport={handleExport} onCopied={setMessage} />
          <TopContributorsChart result={result} />
        </div>
      ) : (
        <ExecutionLog entries={stats.log} />
      )}
    </div>
  );
}
