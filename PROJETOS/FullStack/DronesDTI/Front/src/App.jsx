import { Suspense, lazy, useMemo } from "react";
import { Route, Routes } from "react-router-dom";
import Cabecalho from "./components/Layout/Cabecalho.jsx";
import Rodape from "./components/Layout/Rodape.jsx";
import { SimulacaoContext } from "./hooks/SimulacaoContext.jsx";
import { usePolling } from "./hooks/usePolling.js";
import { simulacaoService } from "./services/api.js";
import Operacao from "./pages/Operacao.jsx";
import Pedidos from "./pages/Pedidos.jsx";
import Rotas from "./pages/Rotas.jsx";
import Frota from "./pages/Frota.jsx";
import NaoEncontrada from "./pages/NaoEncontrada.jsx";

// Páginas pesadas (Recharts) carregadas só quando alguém abre a rota
const Dashboard = lazy(() => import("./pages/Dashboard.jsx"));
const DesignSystem = lazy(() => import("./pages/DesignSystem.jsx"));

export default function App() {
  // Um único "ping" para o site inteiro: tamanho da cidade, relógio e se a API está no ar.
  const { dados, erro } = usePolling(simulacaoService.status, 5000);

  const valor = useMemo(
    () => ({
      cidade: dados
        ? { larguraKm: dados.larguraKm, alturaKm: dados.alturaKm, base: dados.base, metrosPorQuadra: dados.metrosPorQuadra }
        : { larguraKm: 20, alturaKm: 20, base: { x: 10, y: 10 }, metrosPorQuadra: 100 },
      online: dados ? true : erro ? false : null,
      agora: dados?.agora ?? null,
      fatorTempo: dados?.fatorTempo ?? 60,
    }),
    [dados, erro],
  );

  return (
    <SimulacaoContext.Provider value={valor}>
      <Cabecalho online={valor.online} />
      <main>
        <Suspense fallback={<div className="pagina carregando">Carregando…</div>}>
        <Routes>
          <Route path="/" element={<Operacao />} />
          <Route path="/pedidos" element={<Pedidos />} />
          <Route path="/rotas" element={<Rotas />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/frota" element={<Frota />} />
          <Route path="/design" element={<DesignSystem />} />
          <Route path="*" element={<NaoEncontrada />} />
        </Routes>
        </Suspense>
      </main>
      <Rodape />
    </SimulacaoContext.Provider>
  );
}
