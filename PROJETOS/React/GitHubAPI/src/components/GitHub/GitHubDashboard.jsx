import { useState } from "react";
import { FiSearch } from "react-icons/fi";
import GITHUB_CONFIG from "../../config/githubConfig";
import GitHubContributions from "./GitHubContributions";
import GitHubLanguages from "./GitHubLanguages";
import GitHubProfileCard from "./GitHubProfileCard";
import GitHubRepos from "./GitHubRepos";
import GitHubStats from "./GitHubStats";
import "./GitHub.css";

/**
 * Painel completo: busca + perfil + indicadores + contribuições + linguagens + repositórios.
 * Cada parte também funciona sozinha, ex.: <GitHubRepos username="seu-usuario" />.
 *
 * <GitHubDashboard />                         // usa o USERNAME do githubConfig.js
 * <GitHubDashboard username="torvalds" />
 */
export default function GitHubDashboard({ username: initial = GITHUB_CONFIG.USERNAME }) {
  const [username, setUsername] = useState(initial);
  const [input, setInput] = useState(initial);

  const handleSubmit = (event) => {
    event.preventDefault();
    const value = input.trim().replace(/^@/, "");
    if (value) setUsername(value);
  };

  return (
    <div className="gh">
      {GITHUB_CONFIG.ALLOW_SEARCH && (
        <form className="gh-search" onSubmit={handleSubmit} role="search">
          <FiSearch className="gh-search-icon" aria-hidden="true" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Usuário do GitHub"
            aria-label="Usuário do GitHub"
            autoComplete="off"
            spellCheck="false"
          />
          <button type="submit">Buscar</button>
        </form>
      )}

      {/* key={username}: ao trocar de usuário, tudo recomeça do zero */}
      <div key={username} className="gh-sections">
        <GitHubProfileCard username={username} />
        <GitHubStats username={username} />
        <GitHubContributions username={username} />
        <GitHubLanguages username={username} />
        <GitHubRepos username={username} />
      </div>
    </div>
  );
}
