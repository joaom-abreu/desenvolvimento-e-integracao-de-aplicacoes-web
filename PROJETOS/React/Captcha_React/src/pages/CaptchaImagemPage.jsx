import { useRef } from "react";
import { TbPhotoScan } from "react-icons/tb";
import CaptchaPage from "../components/CaptchaPage/CaptchaPage";
import FormularioContato from "../components/FormularioContato/FormularioContato";
import CaptchaImagem from "../components/captchas/CaptchaImagem";

const USO = {
  arquivos: [
    ["api/_services/captchaImagemService.js"],
    ["api/captcha-imagem/index.js", "rota POST"],
    ["api/captcha-imagem/imagem.js", "rota GET /api/captcha-imagem/imagem"],
    ["api/_lib/desafioAssinado.js", "substitui a HttpSession"],
    ["api/_lib/png.js e api/_lib/fonte.js", "desenham o PNG"],
    ["api/_lib/http.js"],
    ["src/components/captchas/CaptchaImagem.jsx"],
    ["src/services/captchaService.js", "função buscarDesafio"],
  ],
  jsx: `const captchaRef = useRef(null);

// Dentro do <form>: imagem + botão + campo
<CaptchaImagem ref={captchaRef} />

// No envio do formulário
// campos = { captcha, desafio }
const campos = await captchaRef.current.obterDados();
await fetch("/api/captcha-imagem", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ nome, mensagem, ...campos }),
});
captchaRef.current.reiniciar(); // nova imagem`,
  env: `DESAFIO_HMAC_KEY=um-texto-longo-e-aleatorio
CAPTCHA_IMAGEM_TAMANHO=5`,
  campo: ["captcha", "desafio"],
  chaves: "Nenhuma chave de provedor. A DESAFIO_HMAC_KEY é um texto aleatório que você inventa.",
  nota: "O texto certo nunca vai para o navegador: vai só um desafio assinado com HMAC, que vale uma vez e expira em 10 minutos.",
};

const CaptchaImagemPage = () => {
  const captchaRef = useRef(null);

  return (
    <CaptchaPage
      icon={TbPhotoScan}
      brand="Captcha de imagem"
      title="Captcha de imagem"
      description="O clássico: letras distorcidas numa imagem PNG gerada pelo próprio servidor, só com o Node. Não depende de internet nem de cadastro. O texto certo nunca vai para o navegador."
      uso={USO}
    >
      <FormularioContato rota="/api/captcha-imagem" captchaRef={captchaRef}>
        <CaptchaImagem ref={captchaRef} />
      </FormularioContato>
    </CaptchaPage>
  );
};

export default CaptchaImagemPage;
