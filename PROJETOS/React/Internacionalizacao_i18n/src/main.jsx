import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Inicializa o i18next ANTES de renderizar: o primeiro render já sai traduzido
import "./i18n";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
