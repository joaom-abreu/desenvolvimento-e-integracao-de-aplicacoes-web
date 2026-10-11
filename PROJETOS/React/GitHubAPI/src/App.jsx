import { SiGithub } from "react-icons/si";
import GitHubDashboard from "./components/GitHub/GitHubDashboard";
import PageLayout from "./components/PageLayout/PageLayout";

function App() {
  return (
    <PageLayout
      icon={SiGithub}
      brand="GitHub API"
      title="Meu perfil no GitHub"
      description="Perfil, contribuições, linguagens e repositórios lidos ao vivo da GitHub API. Busque qualquer usuário para comparar."
    >
      <GitHubDashboard />
    </PageLayout>
  );
}

export default App;
