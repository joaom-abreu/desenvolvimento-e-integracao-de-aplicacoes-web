import { MdSubtitles } from "react-icons/md";
import PageLayout from "./components/PageLayout/PageLayout";
import SubtitlesGenerator from "./components/SubtitlesGenerator/SubtitlesGenerator";

function App() {
  return (
    <PageLayout
      icon={MdSubtitles}
      brand="Subtitles Generator"
      title="Gerador de legendas"
      description="Escolha um vídeo (MP4, AVI, MKV...) e gere a legenda em português do Brasil no formato .srt. O áudio é extraído no próprio navegador e transcrito (ou traduzido) pelo Gemini."
    >
      <SubtitlesGenerator />
    </PageLayout>
  );
}

export default App;
