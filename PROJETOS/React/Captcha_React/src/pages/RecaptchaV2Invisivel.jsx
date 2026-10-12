import { useRef } from "react";
import { SiGoogle } from "react-icons/si";
import CaptchaPage from "../components/CaptchaPage/CaptchaPage";
import FormularioContato from "../components/FormularioContato/FormularioContato";
import ReCaptchaV2 from "../components/captchas/ReCaptchaV2";
import CAPTCHA_CONFIG from "../config/captchaConfig";

const USO = {
  arquivos: [
    ["api/_services/recaptchaV2Service.js", "pode apagar a função validarCheckbox"],
    ["api/recaptcha-v2-invisivel.js", "rota POST"],
    ["api/_lib/http.js"],
    ["src/components/captchas/ReCaptchaV2.jsx"],
    ["src/utils/carregarScript.js"],
  ],
  jsx: `const captchaRef = useRef(null);

// Dentro do <form> (o selo fica no canto da tela)
<ReCaptchaV2 ref={captchaRef} invisivel
  siteKey={CAPTCHA_CONFIG.RECAPTCHA_V2_INVISIVEL_SITE_KEY} />

// No envio: dispara a verificação e espera o token
const campos = await captchaRef.current.obterDados();
if (campos === null) return; // verificação cancelada
await fetch("/api/recaptcha-v2-invisivel", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ nome, mensagem, ...campos }),
});
captchaRef.current.reiniciar();`,
  env: `VITE_RECAPTCHA_V2_INVISIVEL_SITE_KEY=...
RECAPTCHA_V2_INVISIVEL_SECRET_KEY=...`,
  campo: ["g-recaptcha-response"],
  chaves: "Google reCAPTCHA Admin, tipo “v2 > Selo invisível”. A chave do checkbox não serve aqui.",
};

const RecaptchaV2Invisivel = () => {
  const captchaRef = useRef(null);

  return (
    <CaptchaPage
      icon={SiGoogle}
      brand="reCAPTCHA v2"
      title="reCAPTCHA v2 invisível"
      description="O mesmo v2, mas sem caixa: a verificação roda quando a pessoa clica em enviar. O desafio de imagens só aparece se o Google desconfiar. Um selo fica no canto da tela."
      uso={USO}
    >
      <FormularioContato rota="/api/recaptcha-v2-invisivel" captchaRef={captchaRef}>
        <ReCaptchaV2
          ref={captchaRef}
          siteKey={CAPTCHA_CONFIG.RECAPTCHA_V2_INVISIVEL_SITE_KEY}
          invisivel
        />
      </FormularioContato>
    </CaptchaPage>
  );
};

export default RecaptchaV2Invisivel;
