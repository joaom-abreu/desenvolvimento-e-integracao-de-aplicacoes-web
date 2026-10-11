import { SiSpotify } from "react-icons/si";
import PageLayout from "./components/PageLayout/PageLayout";
import SpotifyDashboard from "./components/Spotify/SpotifyDashboard";

function App() {
  return (
    <PageLayout
      icon={SiSpotify}
      brand="Spotify API"
      title="O que eu ando ouvindo"
      description="Lido da Web API do Spotify: a música que está tocando agora, as mais ouvidas, os artistas favoritos e as tocadas recentemente, com o player oficial embutido."
    >
      <SpotifyDashboard />
    </PageLayout>
  );
}

export default App;
