// Estruturas de dados usadas pela regra de negócio (equivalente ao core/models.py).
//
// Datas são guardadas como texto "AAAA-MM-DD" (UTC): comparam-se em ordem
// alfabética e não sofrem com fuso horário.

/** "2025-09-30" -> "30/09/2025" */
export function formatDateBR(isoDay) {
  if (!isoDay) return "";
  const [y, m, d] = isoDay.split("-");
  return `${d}/${m}/${y}`;
}

/** Métricas consolidadas de um colaborador do repositório. */
export class Contributor {
  constructor({
    username,
    key = null, // identificador do autor nos commits (login em minúsculas ou e-mail)
    profileUrl,
    commits,
    additions,
    deletions,
    lastCommit = null,
    lastCommitIsEstimate = false, // true = data veio da semana de atividade (aproximada)
    rank = 0,
    unmergedCommits = null, // commits fora da branch padrão (só em "todas as branches")
    branches = [], // branches (exceto a padrão) com commits ainda não mergeados
  }) {
    Object.assign(this, {
      username,
      key: key ?? username.toLowerCase(),
      profileUrl,
      commits,
      additions,
      deletions,
      lastCommit,
      lastCommitIsEstimate,
      rank,
      unmergedCommits,
      branches,
    });
  }

  /** Impacto líquido = linhas inseridas - linhas deletadas. */
  get netImpact() {
    return this.additions - this.deletions;
  }

  get lastCommitDisplay() {
    if (!this.lastCommit) return "N/A";
    const text = formatDateBR(this.lastCommit);
    return this.lastCommitIsEstimate ? `~${text}` : text;
  }

  /** Linha no formato usado pelo CSV. */
  toRow() {
    return {
      Posição: this.rank,
      "Nome de Usuário": this.username,
      "URL Perfil": this.profileUrl,
      "Commits Totais": this.commits,
      "Linhas Inseridas": this.additions,
      "Linhas Deletadas": this.deletions,
      "Impacto Líquido (Ins - Del)": this.netImpact,
      "Último Commit": this.lastCommitDisplay,
      "Commits Fora da Branch Padrão": this.unmergedCommits ?? "",
      "Branches (não mergeadas)": this.branches.join(", "),
    };
  }
}

/** Resultado completo de uma análise de repositório. */
export class AnalysisResult {
  constructor({
    owner,
    repo,
    contributors = [],
    allBranches = false, // true = considerou todas as branches; false = só a padrão
    defaultBranch = null,
    branchNames = [],
    includeMerges = false,
    // Commits considerados no ranking: [{ oid, authorKey, isMerge }] (só em "todas as branches").
    // A aba "Tipos de arquivo" usa esta lista para buscar os arquivos de cada commit.
    commitRefs = null,
  }) {
    Object.assign(this, {
      owner,
      repo,
      contributors,
      allBranches,
      defaultBranch,
      branchNames,
      includeMerges,
      commitRefs,
    });
  }

  get scopeLabel() {
    if (this.allBranches) return `todas as branches (${this.branchNames.length})`;
    return this.defaultBranch ? `branch padrão (${this.defaultBranch})` : "branch padrão";
  }

  get fullName() {
    return `${this.owner}/${this.repo}`;
  }

  get totalCommits() {
    return this.contributors.reduce((sum, c) => sum + c.commits, 0);
  }

  get totalAdditions() {
    return this.contributors.reduce((sum, c) => sum + c.additions, 0);
  }

  get totalDeletions() {
    return this.contributors.reduce((sum, c) => sum + c.deletions, 0);
  }

  get totalNetImpact() {
    return this.totalAdditions - this.totalDeletions;
  }

  /** Cópia com outra lista de colaboradores (útil para o estado do React). */
  withContributors(contributors) {
    return new AnalysisResult({ ...this, contributors });
  }
}

/**
 * Um commit lido de uma branch (modo "todas as branches").
 * @typedef {Object} CommitRecord
 * @property {string} oid
 * @property {string} authorKey      login do GitHub ou, na falta dele, o e-mail
 * @property {string} authorName
 * @property {string} profileUrl
 * @property {number} additions
 * @property {number} deletions
 * @property {string} authoredDate   ISO 8601
 * @property {string} committedDate  ISO 8601
 * @property {string} messageHeadline
 * @property {boolean} isMerge
 * @property {string} branch         primeira branch em que o commit foi encontrado
 * @property {boolean} inDefaultBranch
 */

/**
 * Mensagem de progresso enviada pela regra de negócio à interface.
 * level: info | success | warning | error
 */
export function progressEvent(message, level = "info", current = null, total = null) {
  return { message, level, current, total };
}
