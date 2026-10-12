import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { carregarScript, novaDivDoWidget } from "../../utils/carregarScript";
import CAPTCHA_CONFIG from "../../config/captchaConfig";

const SCRIPT = "https://www.google.com/recaptcha/api.js";

/**
 * Google reCAPTCHA v3: nenhum desafio na tela, só o selo no canto.
 * Ao enviar, pede ao Google um token para a "action" e o servidor recebe a nota.
 *
 * <ReCaptchaV3 ref={captchaRef} siteKey="..." action="contato" />
 *
 * captchaRef.current.obterDados() → { "g-recaptcha-response": token }
 */
const ReCaptchaV3 = ({ ref, siteKey, action }) => {
  const containerRef = useRef(null);
  const widgetId = useRef(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    if (!siteKey) return undefined;
    let ativo = true;
    let div = null;

    // Mesmo script do v2 (render=explicit): assim v2 e v3 convivem no mesmo site
    carregarScript(SCRIPT, { hl: CAPTCHA_CONFIG.LANGUAGE })
      .then(() => {
        if (!ativo) return;
        div = novaDivDoWidget(containerRef.current);
        widgetId.current = window.grecaptcha.render(div, {
          sitekey: siteKey,
          badge: "bottomright",
          size: "invisible",
        });
      })
      .catch((e) => ativo && setErro(e.message));

    return () => {
      ativo = false;
      div?.remove();
      widgetId.current = null;
    };
  }, [siteKey]);

  useImperativeHandle(ref, () => ({
    async obterDados() {
      const id = widgetId.current;
      if (id === null) return { "g-recaptcha-response": "" };

      // A action precisa ser igual à conferida no servidor (api/recaptcha-v3.js)
      const token = await new Promise((resolve) => {
        window.grecaptcha.ready(() => {
          window.grecaptcha.execute(id, { action }).then(resolve, () => resolve(""));
        });
      });
      return { "g-recaptcha-response": token };
    },

    // Cada envio pede um token novo: não há o que reiniciar
    reiniciar() {},
  }));

  return (
    <div className="captcha-widget-invisivel" ref={containerRef}>
      {erro && <p className="captcha-aviso">{erro}</p>}
    </div>
  );
};

export default ReCaptchaV3;
