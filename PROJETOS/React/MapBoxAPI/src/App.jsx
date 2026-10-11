import { lazy, Suspense } from "react";
import { SiMapbox } from "react-icons/si";
import PageLayout from "./components/PageLayout/PageLayout";
import PLACES from "./data/places";

// lazy(): o mapbox-gl (~1,7 MB) só é baixado quando o mapa aparece na tela,
// e não junto com o resto do site
const MapExplorer = lazy(() => import("./components/MapExplorer/MapExplorer"));

function App() {
  return (
    <PageLayout
      icon={SiMapbox}
      brand="Mapbox API"
      title="Onde estou no mapa"
      description="Mapa interativo com o Mapbox GL JS: as unidades da PUC Minas com marcadores e popups, busca de endereços e troca de estilo."
    >
      <Suspense fallback={<p className="map-fallback">Carregando mapa...</p>}>
        <MapExplorer places={PLACES} />
      </Suspense>
    </PageLayout>
  );
}

export default App;
