import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Redirect from "./pages/Redirect";

// As mesmas rotas do UrlController (Spring Boot), agora no React Router:
//   POST /api/shorten      ->  "/"           (Home: caixa para encurtar)
//   GET  /api/{shortUrl}   ->  "/:shortUrl"  (Redirect: busca e redireciona)
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/:shortUrl" element={<Redirect />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
