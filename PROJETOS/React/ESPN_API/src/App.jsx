import PageLayout from "./components/PageLayout/PageLayout";
import EspnDashboard, { EspnIcon } from "./components/ESPN/EspnDashboard";

function App() {
  return (
    <PageLayout
      icon={EspnIcon}
      brand="ESPN API"
      title="Futebol e basquete ao vivo"
      description="Próximos jogos, resultados e classificação lidos da API pública da ESPN: o Brasileirão (com o Galo em destaque) e a NBA, com contagem regressiva e placar ao vivo."
    >
      <EspnDashboard />
    </PageLayout>
  );
}

export default App;
