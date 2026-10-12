import { useRef } from "react";
import { SiCloudflare } from "react-icons/si";
import CaptchaPage from "../components/CaptchaPage/CaptchaPage";
import FormularioContato from "../components/FormularioContato/FormularioContato";
import Turnstile from "../components/captchas/Turnstile";
import CAPTCHA_CONFIG from "../config/captchaConfig";

const USO = {
  arquivos: [
    ["api/_services/turnstileService.js"],
    ["api/turnstile.js", "rota POST"],
    ["api/_lib/http.js"],
    ["src/components/captchas/Turnstile.jsx"],
    ["src/utils/carregarScript.js"],
  ],
  jsx: `const captchaRef = useRef(null);

// Dentro do <form>
<Turnstile ref={captchaRef} siteKey={CAPTCHA_CONFIG.TURNSTILE_SITE_KEY} />

// No envio do formulário
const campos = await captchaRef.current.obterDados();
await fetch("/api/turnstile", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ nome, mensagem, ...campos }),
});
captchaRef.current.reiniciar();`,
  env: `VITE_TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...`,
  campo: ["cf-turnstile-response"],
  chaves: "dash.cloudflare.com > Turnstile > Add widget. Conta gratuita.",
};

const TurnstilePage = () => {
  const captchaRef = useRef(null);

  return (
    <CaptchaPage
      icon={SiCloudflare}
      brand="Turnstile"
      title="Cloudflare Turnstile"
      description="Na maioria das vezes a pessoa não faz nada: o selo verifica o navegador sozinho e fica verde. Às vezes pede um clique. Gratuito, e o site não precisa usar a Cloudflare."
      uso={USO}
    >
      <FormularioContato rota="/api/turnstile" captchaRef={captchaRef}>
        <Turnstile ref={captchaRef} siteKey={CAPTCHA_CONFIG.TURNSTILE_SITE_KEY} />
      </FormularioContato>
    </CaptchaPage>
  );
};

export default TurnstilePage;
