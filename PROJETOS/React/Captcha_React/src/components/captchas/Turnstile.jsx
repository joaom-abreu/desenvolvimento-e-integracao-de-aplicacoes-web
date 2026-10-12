import { useEffect, useImperativeHandle, useRef, useState } from "react";
import { carregarScript, novaDivDoWidget } from "../../utils/carregarScript";

const SCRIPT = "https://challenges.cloudflare.com/turnstile/v0/api.js";

/**
 * Cloudflare Turnstile: normalmente a pessoa não faz nada, o selo fica verde.
 *
 * <Turnstile ref={captchaRef} siteKey="..." />
 *
 * captchaRef.current.obterDados() → { "cf-turnstile-response": token }
 */
const Turnstile = ({ ref, siteKey }) => {
  const containerRef = useRef(null);
  const widgetId = useRef(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    let ativo = true;
    let div = null;

    carregarScript(SCRIPT)
      .then(() => {
        if (!ativo) return;
        div = novaDivDoWidget(containerRef.current);
        widgetId.current = window.turnstile.render(div, {
          sitekey: siteKey,
          language: "pt-br",
        });
      })
      .catch((e) => ativo && setErro(e.message));

    return () => {
      ativo = false;
      if (widgetId.current) window.turnstile.remove(widgetId.current);
      div?.remove();
      widgetId.current = null;
    };
  }, [siteKey]);

  useImperativeHandle(ref, () => ({
    async obterDados() {
      const id = widgetId.current;
      return { "cf-turnstile-response": id ? window.turnstile.getResponse(id) ?? "" : "" };
    },
    reiniciar() {
      if (widgetId.current) window.turnstile.reset(widgetId.current);
    },
  }));

  return (
    <div className="captcha-widget" ref={containerRef}>
      {erro && <p className="captcha-aviso">{erro}</p>}
    </div>
  );
};

export default Turnstile;
