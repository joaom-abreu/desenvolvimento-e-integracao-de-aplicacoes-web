import { useRef } from "react";
import { TbMathSymbols } from "react-icons/tb";
import CaptchaPage from "../components/CaptchaPage/CaptchaPage";
import FormularioContato from "../components/FormularioContato/FormularioContato";
import CaptchaMatematico from "../components/captchas/CaptchaMatematico";

const USO = {
  arquivos: [
    ["api/_services/captchaMatematicoService.js"],
    ["api/captcha-matematico/index.js", "rota POST"],
    ["api/captcha-matematico/pergunta.js", "rota GET /api/captcha-matematico/pergunta"],
    ["api/_lib/desafioAssinado.js", "substitui a HttpSession"],
    ["api/_lib/http.js"],
    ["src/components/captchas/CaptchaMatematico.jsx"],
    ["src/services/captchaService.js", "função buscarDesafio"],
  ],
  jsx: `const captchaRef = useRef(null);

// Dentro do <form> (a conta vem do servidor)
<CaptchaMatematico ref={captchaRef} />

// No envio do formulário
// campos = { resposta, desafio }
const campos = await captchaRef.current.obterDados();
await fetch("/api/captcha-matematico", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ nome, mensagem, ...campos }),
});
captchaRef.current.reiniciar(); // nova conta`,
  env: `DESAFIO_HMAC_KEY=um-texto-longo-e-aleatorio`,
  campo: ["resposta", "desafio"],
  chaves: "Nenhuma chave de provedor. A DESAFIO_HMAC_KEY é um texto aleatório que você inventa.",
};

const CaptchaMatematicoPage = () => {
  const captchaRef = useRef(null);

  return (
    <CaptchaPage
      icon={TbMathSymbols}
      brand="Captcha matemático"
      title="Captcha matemático"
      description="Uma conta simples. É o mais fácil de entender e de implementar, e o mais fácil para um robô resolver. Serve bem para aprender o conceito de desafio guardado no servidor."
      uso={USO}
    >
      <FormularioContato rota="/api/captcha-matematico" captchaRef={captchaRef}>
        <CaptchaMatematico ref={captchaRef} />
      </FormularioContato>
    </CaptchaPage>
  );
};

export default CaptchaMatematicoPage;
