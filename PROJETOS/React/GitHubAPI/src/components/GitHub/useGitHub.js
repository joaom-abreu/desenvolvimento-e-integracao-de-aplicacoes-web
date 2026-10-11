import { useEffect, useState } from "react";
import GITHUB_CONFIG from "../../config/githubConfig";

/**
 * Hook genérico: chama fetcher(username) e devolve { status, data, error }.
 *   status: "loading" | "ready" | "error"
 *
 * const { status, data } = useGitHub(fetchProfile, "joaopauloaramuni");
 */
export default function useGitHub(fetcher, username) {
  const [state, setState] = useState({ status: "loading", data: null, error: null });

  useEffect(() => {
    if (!username) return;
    let active = true;
    setState({ status: "loading", data: null, error: null });

    fetcher(username)
      .then((data) => active && setState({ status: "ready", data, error: null }))
      .catch((error) => active && setState({ status: "error", data: null, error }));

    return () => {
      active = false;
    };
  }, [fetcher, username]);

  return state;
}

// Formatação compartilhada pelos componentes (pt-BR)
export const formatNumber = (value = 0) => new Intl.NumberFormat("pt-BR").format(value);

export const formatCompact = (value = 0) =>
  new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(value);

export function formatDate(value, options = { day: "numeric", month: "short", year: "numeric" }) {
  if (!value) return "";
  const date = new Date(value.length === 10 ? `${value}T12:00:00` : value);
  return new Intl.DateTimeFormat("pt-BR", options).format(date);
}

// Repositórios que entram nas contas e na lista (sem forks/arquivados, se configurado)
export const visibleRepos = (repos = []) =>
  repos.filter(
    (repo) =>
      !(GITHUB_CONFIG.HIDE_FORKS && repo.fork) &&
      !(GITHUB_CONFIG.HIDE_ARCHIVED && repo.archived)
  );
