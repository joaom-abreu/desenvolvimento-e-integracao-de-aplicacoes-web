import { useRef } from "react";
import { SiGoogle } from "react-icons/si";
import CaptchaPage from "../components/CaptchaPage/CaptchaPage";
import FormularioContato from "../components/FormularioContato/FormularioContato";
import ReCaptchaV3 from "../components/captchas/ReCaptchaV3";
import CAPTCHA_CONFIG from "../config/captchaConfig";

const USO = {
  arquivos: [
    ["api/_services/recaptchaV3Service.js"],
    ["api/recaptcha-v3.js", "rota POST, com a ACAO esperada"],
    ["api/_lib/http.js"],
    ["src/components/captchas/ReCaptchaV3.jsx"],
    ["src/utils/carregarScript.js"],
  ],
  jsx: `const captchaRef = useRef(null);

// Dentro do <form> (o selo fica no canto da tela)
<ReCaptchaV3 ref={captchaRef} action="contato"
  siteKey={CAPTCHA_CONFIG.RECAPTCHA_V3_SITE_KEY} />

// No envio: pede um token para a action "contato"
const campos = await captchaRef.current.obterDados();
await fetch("/api/recaptcha-v3", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ nome, mensagem, ...campos }),
});`,
  env: `VITE_RECAPTCHA_V3_SITE_KEY=...
RECAPTCHA_V3_SECRET_KEY=...
RECAPTCHA_V3_SCORE_MINIMO=0.5`,
  campo: ["g-recaptcha-response"],
  chaves: "Google reCAPTCHA Admin, tipo “v3 (baseado em pontuação)”.",
  nota: "A action do front (RECAPTCHA_V3_ACTION) precisa ser igual à ACAO conferida em api/recaptcha-v3.js.",
};

const RecaptchaV3 = () => {
  const captchaRef = useRef(null);
  const siteKey = CAPTCHA_CONFIG.RECAPTCHA_V3_SITE_KEY;

  return (
    <CaptchaPage
      icon={SiGoogle}
      brand="reCAPTCHA v3"
      title="reCAPTCHA v3"
      description="Nenhuma interação. O Google observa o comportamento na página e devolve uma nota de 0.0 (robô) a 1.0 (humano). O servidor decide o corte: aqui, 0.5."
      aviso={
        !siteKey && (
          <>
            O Google não oferece chave de teste para o v3. Crie uma chave v3 com o domínio{" "}
            <code>localhost</code> e coloque a <code>VITE_RECAPTCHA_V3_SITE_KEY</code> e a{" "}
            <code>RECAPTCHA_V3_SECRET_KEY</code> no <code>.env.local</code> para esta
            demonstração funcionar.
          </>
        )
      }
      uso={USO}
    >
      <FormularioContato rota="/api/recaptcha-v3" captchaRef={captchaRef}>
        <ReCaptchaV3
          ref={captchaRef}
          siteKey={siteKey}
          action={CAPTCHA_CONFIG.RECAPTCHA_V3_ACTION}
        />
      </FormularioContato>
    </CaptchaPage>
  );
};

export default RecaptchaV3;
