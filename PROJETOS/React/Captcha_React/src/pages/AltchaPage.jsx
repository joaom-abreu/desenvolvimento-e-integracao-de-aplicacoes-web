import { useRef } from "react";
import { TbCpu } from "react-icons/tb";
import CaptchaPage from "../components/CaptchaPage/CaptchaPage";
import FormularioContato from "../components/FormularioContato/FormularioContato";
import Altcha from "../components/captchas/Altcha";

const USO = {
  arquivos: [
    ["api/_services/altchaService.js"],
    ["api/altcha/index.js", "rota POST"],
    ["api/altcha/desafio.js", "rota GET /api/altcha/desafio"],
    ["api/_lib/http.js"],
    ["api/_lib/desafioAssinado.js", "só a função iguais"],
    ["src/components/captchas/Altcha.jsx"],
  ],
  jsx: `// npm install altcha
const captchaRef = useRef(null);

// Dentro do <form> (desafio vem de /api/altcha/desafio)
<Altcha ref={captchaRef} />

// No envio do formulário
const campos = await captchaRef.current.obterDados();
await fetch("/api/altcha", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ nome, mensagem, ...campos }),
});
captchaRef.current.reiniciar();`,
  env: `ALTCHA_HMAC_KEY=um-texto-longo-e-aleatorio
ALTCHA_MAX_NUMBER=100000
ALTCHA_VALIDADE_MINUTOS=10`,
  campo: ["altcha"],
  chaves: "Nenhum cadastro. A chave HMAC é um texto aleatório que você mesmo inventa.",
  nota: "O widget usa a Web Crypto do navegador, que só funciona em https ou em localhost.",
};

const AltchaPage = () => {
  const captchaRef = useRef(null);

  return (
    <CaptchaPage
      icon={TbCpu}
      brand="ALTCHA"
      title="ALTCHA"
      description="Prova de trabalho: ao marcar a caixa, o navegador faz alguns milhares de contas para achar um número secreto. Não usa conta em nenhuma empresa nem cookies. O desafio é criado e conferido pelo nosso próprio servidor."
      uso={USO}
    >
      <FormularioContato rota="/api/altcha" captchaRef={captchaRef}>
        <Altcha ref={captchaRef} />
      </FormularioContato>
    </CaptchaPage>
  );
};

export default AltchaPage;
