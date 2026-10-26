import { Suspense, lazy, useMemo } from "react";
import { Route, Routes } from "react-router-dom";
import Cabecalho from "./components/Layout/Cabecalho.jsx";
import Rodape from "./components/Layout/Rodape.jsx";
import { CONFIGURACAO_PADRAO, JogoContext } from "./hooks/JogoContext.jsx";
import { usePolling } from "./hooks/usePolling.js";
import { jogoService } from "./services/api.js";
import Jogar from "./pages/Jogar.jsx";
import Ranking from "./pages/Ranking.jsx";
import NaoEncontrada from "./pages/NaoEncontrada.jsx";

// Páginas menos visitadas carregadas só quando alguém abre a rota
const Estatisticas = lazy(() => import("./pages/Estatisticas.jsx"));
const DesignSystem = lazy(() => import("./pages/DesignSystem.jsx"));

export default function App() {
  // Um único "ping" para o site inteiro: limites do jogo e se a API está no ar.
  const { dados, erro } = usePolling(jogoService.configuracao, 10000);

  const valor = useMemo(
    () => ({
      configuracao: dados ?? CONFIGURACAO_PADRAO,
      online: dados ? true : erro ? false : null,
    }),
    [dados, erro],
  );

  return (
    <JogoContext.Provider value={valor}>
      <Cabecalho online={valor.online} />
      <main>
        <Suspense fallback={<div className="pagina carregando">Carregando…</div>}>
          <Routes>
            <Route path="/" element={<Jogar />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/estatisticas" element={<Estatisticas />} />
            <Route path="/design" element={<DesignSystem />} />
            <Route path="*" element={<NaoEncontrada />} />
          </Routes>
        </Suspense>
      </main>
      <Rodape />
    </JogoContext.Provider>
  );
}
