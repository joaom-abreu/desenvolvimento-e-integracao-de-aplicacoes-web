import { lazy, Suspense, useEffect } from "react";
import { Route, Routes, useLocation } from "react-router";
import Footer from "./components/Footer";
import Header from "./components/Header";
import SplashCursor from "./components/SplashCursor/SplashCursor";
import { useStatusIntegracao } from "./hooks/useStatusIntegracao";
import Cardapio from "./pages/Cardapio";
import Contato from "./pages/Contato";
import Gerenciar from "./pages/Gerenciar";
import Home from "./pages/Home";
import NaoEncontrada from "./pages/NaoEncontrada";
import "./App.css";

// O leitor de PDF (PDF.js) é pesado: só é baixado quando alguém abre /cardapio/pdf
const CardapioPdf = lazy(() => import("./pages/CardapioPdf"));

// O design system também fica fora do pacote principal (é uma página de consulta)
const DesignSystem = lazy(() => import("./pages/DesignSystem"));

/** Quem pediu "reduzir movimento" no sistema operacional não vê a fumaça */
const prefereMenosMovimento =
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Volta ao topo sempre que a página (rota) muda */
const VoltarAoTopo = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App = () => {
  // Um único "vigia" do back-end para o site inteiro (rodapé, cardápio e painel de gestão)
  const { status, conectado } = useStatusIntegracao();

  return (
    <>
      {/* React Bits: fumaça marrom que segue o mouse pelo fundo da página */}
      {!prefereMenosMovimento && <SplashCursor />}

      <div className="site">
        <a href="#conteudo" className="pular-para-conteudo">
          Pular para o conteúdo
        </a>

        <Header />
        <VoltarAoTopo />

        <main id="conteudo" className="site-conteudo">
          <Routes>
            <Route path="/" element={<Home status={status} conectado={conectado} />} />
            <Route path="/cardapio" element={<Cardapio status={status} conectado={conectado} />} />
            <Route
              path="/cardapio/pdf"
              element={
                <Suspense fallback={<p className="container carregando-pagina">Abrindo o leitor de PDF…</p>}>
                  <CardapioPdf />
                </Suspense>
              }
            />
            <Route path="/contato" element={<Contato />} />
            <Route
              path="/design"
              element={
                <Suspense fallback={<p className="container carregando-pagina">Abrindo o design system…</p>}>
                  <DesignSystem />
                </Suspense>
              }
            />
            <Route path="/gerenciar" element={<Gerenciar status={status} conectado={conectado} />} />
            <Route path="*" element={<NaoEncontrada />} />
          </Routes>
        </main>

        <Footer status={status} />
      </div>
    </>
  );
};

export default App;
