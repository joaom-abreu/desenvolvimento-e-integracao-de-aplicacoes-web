import { lazy, Suspense } from "react";
import { FaFilePdf } from "react-icons/fa";
import PageLayout from "./components/PageLayout/PageLayout";

// lazy(): o react-pdf + PDF.js (~600 kB) só são baixados quando o visualizador
// aparece na tela, e não junto com o resto do site
const CurriculumViewer = lazy(() => import("./components/CurriculumViewer/CurriculumViewer"));

function App() {
  return (
    <PageLayout
      icon={FaFilePdf}
      brand="Curriculum PDF"
      title="Meu currículo"
      description="Currículo em PDF exibido direto na página com o react-pdf: troque o idioma, dê zoom, baixe ou abra em outra aba."
    >
      <Suspense fallback={<p className="cv-fallback">Carregando visualizador...</p>}>
        <CurriculumViewer />
      </Suspense>
    </PageLayout>
  );
}

export default App;
