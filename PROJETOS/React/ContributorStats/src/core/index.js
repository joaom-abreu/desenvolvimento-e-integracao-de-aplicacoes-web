// Regra de negócio do ContributorStats (equivalente ao pacote core do Python).
// Este módulo não depende de React: pode ser reaproveitado em outra interface.
export {
  ContributorStatsError,
  GitHubAPIError,
  InvalidRepoURLError,
  OperationCancelledError,
  StatsNotReadyError,
} from "./exceptions";
export { CSV_FIELDS, buildCsv, defaultCsvFilename, exportToCsv } from "./exporter";
export { AnalysisResult, Contributor, formatDateBR, progressEvent } from "./models";
export {
  SORT_CRITERIA,
  SortCriterion,
  buildContributors,
  buildContributorsFromCommits,
  rankContributors,
} from "./ranking";
export { parseRepoUrl } from "./repoUrl";
export { analyzeRepository } from "./service";
