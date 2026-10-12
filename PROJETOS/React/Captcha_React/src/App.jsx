import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import RecaptchaV2Checkbox from "./pages/RecaptchaV2Checkbox";
import RecaptchaV2Invisivel from "./pages/RecaptchaV2Invisivel";
import RecaptchaV3 from "./pages/RecaptchaV3";
import HCaptchaPage from "./pages/HCaptchaPage";
import TurnstilePage from "./pages/TurnstilePage";
import AltchaPage from "./pages/AltchaPage";
import CaptchaImagemPage from "./pages/CaptchaImagemPage";
import CaptchaMatematicoPage from "./pages/CaptchaMatematicoPage";
import NotFound from "./pages/NotFound";

// Mesmas URLs do projeto Captcha (Spring Boot), agora no React Router
function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/recaptcha-v2-checkbox" element={<RecaptchaV2Checkbox />} />
      <Route path="/recaptcha-v2-invisivel" element={<RecaptchaV2Invisivel />} />
      <Route path="/recaptcha-v3" element={<RecaptchaV3 />} />
      <Route path="/hcaptcha" element={<HCaptchaPage />} />
      <Route path="/turnstile" element={<TurnstilePage />} />
      <Route path="/altcha" element={<AltchaPage />} />
      <Route path="/captcha-imagem" element={<CaptchaImagemPage />} />
      <Route path="/captcha-matematico" element={<CaptchaMatematicoPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
