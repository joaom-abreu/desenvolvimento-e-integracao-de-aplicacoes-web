import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { carregarScript, novaDivDoWidget } from "../../utils/carregarScript";

const SCRIPT = "https://js.hcaptcha.com/1/api.js";

/**
 * hCaptcha: igual ao reCAPTCHA v2 checkbox, de outra empresa.
 *
 * <HCaptcha ref={captchaRef} siteKey="..." />
 *
 * captchaRef.current.obterDados() → { "h-captcha-response": token }
 */
const HCaptcha = ({ ref, siteKey }) => {
  const containerRef = useRef(null);
  const widgetId = useRef(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let ativo = true;
    let div = null;

    carregarScript(SCRIPT, { hl: "pt" })
      .then(() => {
        if (!ativo) return;
        div = novaDivDoWidget(containerRef.current);
        widgetId.current = window.hcaptcha.render(div, { sitekey: siteKey });
      })
      .catch((e) => ativo && setErro(e.message));

    return () => {
      ativo = false;
      if (widgetId.current !== null) window.hcaptcha.remove(widgetId.current);
      div?.remove();
      widgetId.current = null;
    };
  }, [siteKey]);

  useImperativeHandle(ref, () => ({
    async obterDados() {
      const id = widgetId.current;
      return { "h-captcha-response": id === null ? "" : window.hcaptcha.getResponse(id) };
    },
    reiniciar() {
      if (widgetId.current !== null) window.hcaptcha.reset(widgetId.current);
    },
  }));

  return (
    <div className="captcha-widget" ref={containerRef}>
      {erro && <p className="captcha-aviso">{erro}</p>}
    </div>
  );
};

export default HCaptcha;
