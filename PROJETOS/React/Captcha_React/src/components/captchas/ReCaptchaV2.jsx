import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { carregarScript, novaDivDoWidget } from "../../utils/carregarScript";
import CAPTCHA_CONFIG from "../../config/captchaConfig";

const SCRIPT = "https://www.google.com/recaptcha/api.js";

/**
 * Google reCAPTCHA v2: checkbox ("Não sou um robô") ou invisível.
 *
 * <ReCaptchaV2 ref={captchaRef} siteKey="..." />            // checkbox
 * <ReCaptchaV2 ref={captchaRef} siteKey="..." invisivel />  // selo invisível
 *
 * captchaRef.current.obterDados() → { "g-recaptcha-response": token }
 * captchaRef.current.reiniciar()  → desmarca / gera um token novo
 */
const ReCaptchaV2 = ({ ref, siteKey, invisivel = false }) => {
  const containerRef = useRef(null);
  const widgetId = useRef(null);
  const pendente = useRef(null); // invisível: resolve do token que está chegando
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let ativo = true;
    let div = null;

    carregarScript(SCRIPT, { hl: CAPTCHA_CONFIG.LANGUAGE })
      .then(() => {
        if (!ativo) return;
        div = novaDivDoWidget(containerRef.current);
        widgetId.current = window.grecaptcha.render(div, {
          sitekey: siteKey,
          size: invisivel ? "invisible" : "normal",
          badge: "bottomright",
          // No invisível, o token chega aqui depois do grecaptcha.execute()
          callback: (token) => {
            pendente.current?.(token);
            pendente.current = null;
          },
        });
      })
      .catch((e) => ativo && setErro(e.message));

    return () => {
      ativo = false;
      div?.remove();
      widgetId.current = null;
    };
  }, [siteKey, invisivel]);

  useImperativeHandle(ref, () => ({
    async obterDados() {
      const id = widgetId.current;
      if (id === null) return { "g-recaptcha-response": "" };

      // Checkbox: o token já está pronto se a caixa foi marcada
      if (!invisivel) return { "g-recaptcha-response": window.grecaptcha.getResponse(id) };

      // Invisível: dispara a verificação ao enviar e espera o token.
      // Se a pessoa clicar de novo antes, o clique anterior é cancelado (null).
      pendente.current?.(null);
      const token = await new Promise((resolve) => {
        pendente.current = resolve;
        window.grecaptcha.reset(id);
        window.grecaptcha.execute(id);
      });
      return token === null ? null : { "g-recaptcha-response": token };
    },

    reiniciar() {
      // Cada token do reCAPTCHA vale para uma única tentativa
      if (widgetId.current !== null) window.grecaptcha.reset(widgetId.current);
    },
  }));

  return (
    <div className={invisivel ? "captcha-widget-invisivel" : "captcha-widget"} ref={containerRef}>
      {erro && <p className="captcha-aviso">{erro}</p>}
    </div>
  );
};

export default ReCaptchaV2;
