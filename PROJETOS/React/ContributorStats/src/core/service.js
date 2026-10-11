// Caso de uso principal: analisar um repositório e produzir o ranking
// (equivalente ao core/service.py do Python).
//
// É a única função que a interface precisa chamar. Ela não conhece React:
// comunica o andamento por meio de onProgress e pode ser cancelada com um
// AbortSignal (o equivalente ao threading.Event do Python).
import CONFIG from "../config/contributorStatsConfig";
import { GitHubClient } from "../services/githubClient";
import { ContributorStatsError, OperationCancelledError } from "./exceptions";
import { AnalysisResult, progressEvent } from "./models";
import {
  SortCriterion,
  buildContributors,
  buildContributorsFromCommits,
  rankContributors,
} from "./ranking";
import { parseRepoUrl } from "./repoUrl";

const noop = () => {};
const cancelled = () => new OperationCancelledError("Operação cancelada.");

/**
 * Com allBranches = true (padrão), percorre o histórico de TODAS as
 * branches via GraphQL, sem contar o mesmo commit duas vezes.
 *
 * Com allBranches = false, usa /stats/contributors (só a branch padrão):
 * 1. interpreta a URL;
 * 2. busca as estatísticas (com polling);
 * 3. monta e ordena o ranking;
 * 4. opcionalmente busca a data exata do último commit (em paralelo).
 */
export async function analyzeRepository(
  repoUrl,
  {
    criterion = SortCriterion.COMMITS,
    fetchExactDates = true,
    allBranches = true,
    includeMerges = false,
    onProgress = noop,
    signal,
    client = new GitHubClient(),
  } = {}
) {
  const { owner, repo } = parseRepoUrl(repoUrl);

  // O token fica no servidor: aqui só perguntamos se ele foi configurado
  const { hasToken } = await client.fetchStatus(signal);

  if (allBranches) {
    if (!hasToken) {
      throw new ContributorStatsError(
        "A análise de todas as branches usa a API GraphQL do GitHub, que exige " +
          'um token. Configure o GITHUB_TOKEN no .env.local ou desative a opção "todas as branches".'
      );
    }
    return analyzeAllBranches(client, owner, repo, criterion, includeMerges, onProgress, signal);
  }

  if (!hasToken) {
    onProgress(
      progressEvent(
        "Nenhum token informado: apenas repositórios públicos poderão ser " +
          "analisados (limite de 60 requisições/hora).",
        "warning"
      )
    );
  }

  const raw = await client.fetchContributorsStats(owner, repo, { onProgress, signal });
  const contributors = buildContributors(raw);

  if (fetchExactDates && contributors.length) {
    const total = contributors.length;
    onProgress(progressEvent("Buscando a data do último commit…", "info", 0, total));

    // ignora autores desconhecidos
    const queue = contributors.filter((c) => c.profileUrl);
    let done = total - queue.length;

    // Até MAX_WORKERS requisições simultâneas (o ThreadPoolExecutor do Python)
    const worker = async () => {
      while (queue.length) {
        const contributor = queue.shift();
        let exact = null;
        try {
          exact = await client.fetchLastCommitDate(owner, repo, contributor.username, signal);
        } catch {
          exact = null; // falha pontual não interrompe a análise
        }
        if (signal?.aborted) throw cancelled();
        if (exact !== null) {
          contributor.lastCommit = exact;
          contributor.lastCommitIsEstimate = false;
        }
        done += 1;
        onProgress(
          progressEvent(
            `Último commit de ${contributor.username}: ${contributor.lastCommitDisplay}`,
            "info",
            done,
            total
          )
        );
      }
    };
    await Promise.all(
      Array.from({ length: Math.min(CONFIG.MAX_WORKERS, queue.length) }, worker)
    );
  }

  const ranked = rankContributors(contributors, criterion);
  onProgress(progressEvent(`Ranking gerado com ${ranked.length} colaborador(es).`, "success"));
  return new AnalysisResult({ owner, repo, contributors: ranked, allBranches: false });
}

/**
 * Lê o histórico de cada branch (a padrão primeiro) e deduplica os commits:
 *
 * - pelo SHA: um commit presente em várias branches conta uma vez só;
 * - por "impressão digital" (autor + data de autoria + mensagem + linhas):
 *   commits copiados por rebase ou cherry-pick têm outro SHA, mas são o
 *   mesmo trabalho, então também contam uma vez só.
 *
 * Commits de merge são ignorados por padrão (as alterações já foram contadas
 * nos commits originais da branch).
 */
async function analyzeAllBranches(client, owner, repo, criterion, includeMerges, onProgress, signal) {
  onProgress(progressEvent(`Listando as branches de ${owner}/${repo}…`));
  const { defaultBranch, branches } = await client.fetchBranches(owner, repo, signal);
  if (!branches.length) {
    onProgress(progressEvent("O repositório não possui branches/commits.", "warning"));
    return new AnalysisResult({ owner, repo, allBranches: true, defaultBranch });
  }

  onProgress(
    progressEvent(
      `${branches.length} branch(es) encontrada(s). Branch padrão: ${defaultBranch}.`,
      "success"
    )
  );

  const seenOids = new Set();
  const seenFingerprints = new Set();
  const walkedTips = new Set();
  const commits = [];
  let skippedMerges = 0;
  let skippedCopies = 0;
  const total = branches.length;

  for (const [i, { name: branch, oid: tip }] of branches.entries()) {
    const index = i + 1;
    if (signal?.aborted) throw cancelled();
    const inDefault = branch === defaultBranch;
    if (walkedTips.has(tip) || seenOids.has(tip)) {
      // Branch sem nenhum commit próprio (aponta para um commit já lido)
      onProgress(progressEvent(`Branch ${branch}: sem commits novos.`, "info", index, total));
      continue;
    }
    walkedTips.add(tip);

    let newHere = 0;
    for await (const node of client.iterBranchHistory(owner, repo, tip, { signal })) {
      const oid = node.oid;
      if (seenOids.has(oid)) continue;
      seenOids.add(oid);
      const record = GitHubClient.toCommitRecord(node, branch, inDefault);
      if (record.isMerge && !includeMerges) {
        skippedMerges += 1;
        continue;
      }
      const fingerprint = JSON.stringify([
        record.authorKey,
        record.authoredDate,
        record.messageHeadline,
        record.additions,
        record.deletions,
      ]);
      if (seenFingerprints.has(fingerprint)) {
        skippedCopies += 1;
        continue;
      }
      seenFingerprints.add(fingerprint);
      commits.push(record);
      newHere += 1;
    }

    const label = inDefault ? "padrão" : "novos (fora da padrão)";
    onProgress(progressEvent(`Branch ${branch}: ${newHere} commit(s) ${label}.`, "info", index, total));
  }

  if (skippedMerges) onProgress(progressEvent(`${skippedMerges} commit(s) de merge ignorado(s).`));
  if (skippedCopies) {
    onProgress(
      progressEvent(`${skippedCopies} commit(s) duplicado(s) por rebase/cherry-pick ignorado(s).`)
    );
  }

  const contributors = buildContributorsFromCommits(commits);
  const ranked = rankContributors(contributors, criterion);
  const unmerged = commits.filter((c) => !c.inDefaultBranch).length;
  onProgress(
    progressEvent(
      `Ranking gerado com ${ranked.length} colaborador(es) · ${commits.length} commit(s) ` +
        `únicos em ${total} branch(es), ${unmerged} fora da ${defaultBranch}.`,
      "success"
    )
  );
  return new AnalysisResult({
    owner,
    repo,
    contributors: ranked,
    allBranches: true,
    defaultBranch,
    branchNames: branches.map((b) => b.name),
  });
}
