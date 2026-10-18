import { FaPix } from "react-icons/fa6";
import PageLayout from "./components/PageLayout/PageLayout";
import PixGenerator from "./components/PixGenerator/PixGenerator";

function App() {
  return (
    <PageLayout
      icon={FaPix}
      brand="Pix Generator"
      title="Gerador de Pix"
      description="Gere o QR Code e o Pix copia e cola de uma chave, com ou sem valor, e veja campo a campo como o BR Code do Banco Central é montado."
    >
      <PixGenerator />
    </PageLayout>
  );
}

export default App;
