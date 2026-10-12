import { useCallback, useEffect, useImperativeHandle, useState } from "react";
import { buscarDesafio } from "../../services/captchaService";

const ROTA_PERGUNTA = "/api/captcha-matematico/pergunta";

/**
 * Captcha matemático: uma conta simples. A resposta nunca vem para o
 * navegador: vem só a pergunta e um desafio assinado.
 *
 * <CaptchaMatematico ref={captchaRef} />
 *
 * captchaRef.current.obterDados() → { resposta: "7", desafio: "..." }
 */
const CaptchaMatematico = ({ ref }) => {
  const [dados, setDados] = useState(null); // { pergunta, desafio }
  const [resposta, setResposta] = useState("");
  const [erro, setErro] = useState(null);

  const novaPergunta = useCallback(async () => {
    setResposta("");
    try {
      setDados(await buscarDesafio(ROTA_PERGUNTA));
      setErro(null);
    } catch (e) {
      setErro(`Não foi possível gerar a conta (${e.message}).`);
    }
  }, []);

  useEffect(() => {
    novaPergunta();
  }, [novaPergunta]);

  useImperativeHandle(ref, () => ({
    async obterDados() {
      return { resposta, desafio: dados?.desafio ?? "" };
    },
    // Errou ou acertou, a conta já foi usada: gera outra
    reiniciar: novaPergunta,
  }));

  return (
    <>
      <label>
        <span>{dados?.pergunta ?? "Carregando a conta..."}</span>
        <input
          type="text"
          name="resposta"
          value={resposta}
          onChange={(e) => setResposta(e.target.value)}
          required
          inputMode="numeric"
          autoComplete="off"
          maxLength={3}
        />
      </label>
      {erro && <p className="captcha-aviso">{erro}</p>}
    </>
  );
};

export default CaptchaMatematico;
