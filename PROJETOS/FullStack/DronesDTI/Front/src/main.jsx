import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

// Fontes da identidade dti (servidas pelo próprio site, sem Google Fonts)
import "@fontsource/red-hat-display/500.css";
import "@fontsource/red-hat-display/700.css";
import "@fontsource/red-hat-display/900.css";
import "@fontsource/red-hat-text/400.css";
import "@fontsource/red-hat-text/500.css";
import "@fontsource/red-hat-text/700.css";

import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
