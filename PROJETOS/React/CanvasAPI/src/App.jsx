import { SiCanvas } from "react-icons/si";
import CanvasDashboard from "./components/Canvas/CanvasDashboard";
import PageLayout from "./components/PageLayout/PageLayout";

function App() {
  return (
    <PageLayout
      icon={SiCanvas}
      brand="Canvas API"
      title="Minhas disciplinas no Canvas"
      description="Cursos, tarefas, prazos, entregas e eventos lidos da API do Canvas LMS: o que vence esta semana, o que falta corrigir (ou entregar) e a agenda dia a dia."
    >
      <CanvasDashboard />
    </PageLayout>
  );
}

export default App;
