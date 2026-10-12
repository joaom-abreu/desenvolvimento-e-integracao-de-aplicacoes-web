import { useCallback, useEffect, useImperativeHandle, useState } from "react";
import { buscarDesafio } from "../../services/captchaService";

const ROTA_IMAGEM = "/api/captcha-imagem/imagem";

/**
 * Captcha de imagem: letras distorcidas num PNG gerado pelo servidor.
 * O texto certo nunca vem para o navegador: vem só a imagem e um desafio
 * assinado, que volta junto no envio.
 *
 * <CaptchaImagem ref={captchaRef} />
 *
 * captchaRef.current.obterDados() → { captcha: "ABCDE", desafio: "..." }
 */
const CaptchaImagem = ({ ref }) => {
  const [dados, setDados] = useState(null); // { imagem, desafio }
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState(null);

  const gerarOutra = useCallback(async () => {
    setTexto("");
    try {
      setDados(await buscarDesafio(ROTA_IMAGEM));
      setErro(null);
    } catch (e) {
      setErro(`Não foi possível gerar a imagem (${e.message}).`);
    }
  }, []);

  useEffect(() => {
    gerarOutra();
  }, [gerarOutra]);

  useImperativeHandle(ref, () => ({
    async obterDados() {
      return { captcha: texto, desafio: dados?.desafio ?? "" };
    },
    // Errou ou acertou, o desafio já foi usado: precisa de uma imagem nova
    reiniciar: gerarOutra,
  }));

  return (
    <>
      <div className="captcha-imagem">
        {dados ? (
          <img src={dados.imagem} width="180" height="60" alt="Imagem com letras para digitar" />
        ) : (
          <span className="captcha-imagem-vazia" aria-hidden="true" />
        )}
        <button type="button" className="botao-secundario" onClick={gerarOutra}>
          Gerar outra imagem
        </button>
      </div>
      {erro && <p className="captcha-aviso">{erro}</p>}

      <label>
        Digite as letras da imagem
        <input
          type="text"
          name="captcha"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          required
          autoComplete="off"
          autoCapitalize="characters"
          maxLength={10}
        />
      </label>
    </>
  );
};

export default CaptchaImagem;
