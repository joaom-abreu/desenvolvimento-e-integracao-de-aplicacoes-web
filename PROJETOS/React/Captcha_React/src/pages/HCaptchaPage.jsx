import { useRef } from "react";
import { TbShieldCheck } from "react-icons/tb";
import CaptchaPage from "../components/CaptchaPage/CaptchaPage";
import FormularioContato from "../components/FormularioContato/FormularioContato";
import HCaptcha from "../components/captchas/HCaptcha";
import CAPTCHA_CONFIG from "../config/captchaConfig";

const USO = {
  arquivos: [
    ["api/_services/hcaptchaService.js"],
    ["api/hcaptcha.js", "rota POST"],
    ["api/_lib/http.js"],
    ["src/components/captchas/HCaptcha.jsx"],
    ["src/utils/carregarScript.js"],
  ],
  jsx: `const captchaRef = useRef(null);

// Dentro do <form>
<HCaptcha ref={captchaRef} siteKey={CAPTCHA_CONFIG.HCAPTCHA_SITE_KEY} />

// No envio do formulário
const campos = await captchaRef.current.obterDados();
await fetch("/api/hcaptcha", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ nome, mensagem, ...campos }),
});
captchaRef.current.reiniciar();`,
  env: `VITE_HCAPTCHA_SITE_KEY=...
HCAPTCHA_SECRET_KEY=...`,
  campo: ["h-captcha-response"],
  chaves: "dashboard.hcaptcha.com. A secret key fica em Settings da conta; a site key, em Sites.",
};

const HCaptchaPage = () => {
  const captchaRef = useRef(null);

  return (
    <CaptchaPage
      icon={TbShieldCheck}
      brand="hCaptcha"
      title="hCaptcha"
      description="Funciona como o reCAPTCHA v2 checkbox, mas de outra empresa, com foco em privacidade. Troca-se o script, o componente e o nome do campo."
      uso={USO}
    >
      <FormularioContato rota="/api/hcaptcha" captchaRef={captchaRef}>
        <HCaptcha ref={captchaRef} siteKey={CAPTCHA_CONFIG.HCAPTCHA_SITE_KEY} />
      </FormularioContato>
    </CaptchaPage>
  );
};

export default HCaptchaPage;
