import { FiBookOpen, FiGitBranch, FiStar, FiUsers } from "react-icons/fi";
import { fetchProfile, fetchRepos } from "../../services/githubService";
import useGitHub, { formatNumber, visibleRepos } from "./useGitHub";
import "./GitHub.css";

/**
 * Indicadores: repositórios, estrelas recebidas, forks e seguidores.
 *
 * <GitHubStats username="joaopauloaramuni" />
 */
export default function GitHubStats({ username }) {
  const profile = useGitHub(fetchProfile, username);
  const repos = useGitHub(fetchRepos, username);

  if (profile.status === "loading" || repos.status === "loading") {
    return (
      <ul className="gh-kpis">
        {[0, 1, 2, 3].map((i) => (
          <li key={i} className="gh-kpi gh-skeleton" />
        ))}
      </ul>
    );
  }
  if (profile.status === "error" || repos.status === "error") return null;

  const list = visibleRepos(repos.data);
  const stars = list.reduce((sum, repo) => sum + repo.stars, 0);
  const forks = list.reduce((sum, repo) => sum + repo.forks, 0);
  const mostStarred = [...list].sort((a, b) => b.stars - a.stars)[0];

  const items = [
    {
      icon: FiBookOpen,
      label: "Repositórios",
      value: formatNumber(profile.data.publicRepos),
      note: "públicos",
    },
    {
      icon: FiStar,
      label: "Estrelas",
      value: formatNumber(stars),
      note: mostStarred ? `mais estrelado: ${mostStarred.name}` : null,
    },
    { icon: FiGitBranch, label: "Forks", value: formatNumber(forks), note: "dos seus repositórios" },
    {
      icon: FiUsers,
      label: "Seguidores",
      value: formatNumber(profile.data.followers),
      note: `seguindo ${formatNumber(profile.data.following)}`,
    },
  ];

  return (
    <ul className="gh-kpis">
      {items.map(({ icon: Icon, label, value, note }) => (
        <li key={label} className="gh-kpi">
          <span className="gh-kpi-label">
            <Icon aria-hidden="true" /> {label}
          </span>
          <span className="gh-kpi-value">{value}</span>
          {note && (
            <span className="gh-kpi-note" title={note}>
              {note}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
