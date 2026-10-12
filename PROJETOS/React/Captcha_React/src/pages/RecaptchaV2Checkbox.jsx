import { useRef } from "react";
import { SiGoogle } from "react-icons/si";
import CaptchaPage from "../components/CaptchaPage/CaptchaPage";
import FormularioContato from "../components/FormularioContato/FormularioContato";
import ReCaptchaV2 from "../components/captchas/ReCaptchaV2";
import CAPTCHA_CONFIG from "../config/captchaConfig";

const USO = {
  arquivos: [
    ["api/_services/recaptchaV2Service.js", "pode apagar a função validarInvisivel"],
    ["api/recaptcha-v2-checkbox.js", "rota POST"],
    ["api/_lib/http.js"],
    ["src/components/captchas/ReCaptchaV2.jsx"],
    ["src/utils/carregarScript.js"],
  ],
  jsx: `const captchaRef = useRef(null);

// Dentro do <form>, antes do botão
<ReCaptchaV2 ref={captchaRef} siteKey={CAPTCHA_CONFIG.RECAPTCHA_V2_CHECKBOX_SITE_KEY} />

// No envio do formulário
const campos = await captchaRef.current.obterDados();
await fetch("/api/recaptcha-v2-checkbox", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ nome, mensagem, ...campos }),
});
captchaRef.current.reiniciar();`,
  env: `VITE_RECAPTCHA_V2_CHECKBOX_SITE_KEY=...
RECAPTCHA_V2_CHECKBOX_SECRET_KEY=...`,
  campo: ["g-recaptcha-response"],
  chaves: "Google reCAPTCHA Admin, tipo “v2 > Caixa de seleção”. Adicione localhost nos domínios.",
};

const RecaptchaV2Checkbox = () => {
  const captchaRef = useRef(null);

  return (
    <CaptchaPage
      icon={SiGoogle}
      brand="reCAPTCHA v2"
      title="reCAPTCHA v2 checkbox"
      description="A caixa “Não sou um robô” do Google. Quando o Google desconfia do visitante, aparece um desafio de imagens. É a versão usada no SecureLoginPUC."
      uso={USO}
    >
      <FormularioContato rota="/api/recaptcha-v2-checkbox" captchaRef={captchaRef}>
        <ReCaptchaV2 ref={captchaRef} siteKey={CAPTCHA_CONFIG.RECAPTCHA_V2_CHECKBOX_SITE_KEY} />
      </FormularioContato>
    </CaptchaPage>
  );
};

export default RecaptchaV2Checkbox;
