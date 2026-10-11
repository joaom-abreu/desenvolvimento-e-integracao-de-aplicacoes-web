import { SiGooglegemini } from "react-icons/si";
import GeminiChat from "./components/GeminiChat/GeminiChat";
import PageLayout from "./components/PageLayout/PageLayout";

function App() {
  return (
    <PageLayout
      icon={SiGooglegemini}
      brand="Gemini API"
      title="Pergunte sobre mim"
      description="Um chat com IA que responde em primeira pessoa sobre minha formação, projetos e habilidades, usando a API do Google Gemini."
    >
      <GeminiChat />
    </PageLayout>
  );
}

export default App;
