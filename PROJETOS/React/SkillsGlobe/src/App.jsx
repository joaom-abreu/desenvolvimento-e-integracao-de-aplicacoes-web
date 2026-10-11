import { TbWorldCode } from "react-icons/tb";
import PageLayout from "./components/PageLayout/PageLayout";
import SkillsSection from "./components/SkillsSection/SkillsSection";
import SKILLS, { CATEGORIES } from "./data/skills";

function App() {
  return (
    <PageLayout
      icon={TbWorldCode}
      brand="Skills Globe"
      title="Minhas habilidades"
      description="Um globo 3D interativo feito só com React, CSS e canvas, sem bibliotecas de 3D. Arraste para girar e filtre por categoria."
    >
      <SkillsSection skills={SKILLS} categories={CATEGORIES} />
    </PageLayout>
  );
}

export default App;
