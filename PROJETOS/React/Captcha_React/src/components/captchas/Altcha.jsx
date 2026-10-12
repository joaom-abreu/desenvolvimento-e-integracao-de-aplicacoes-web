import { useEffect, useImperativeHandle, useRef } from "react";
// O widget do ALTCHA é um Web Component (<altcha-widget>) instalado pelo npm.
// Como vem do npm, funciona sem internet (o desafio vem do nosso servidor).
import "altcha";
import "altcha/i18n/pt-br";

/**
 * ALTCHA: prova de trabalho. Ao marcar a caixa, o navegador procura o número
 * secreto do desafio que veio de GET /api/altcha/desafio.
 *
 * <Altcha ref={captchaRef} />
 *
 * captchaRef.current.obterDados() → { altcha: payloadEmBase64 }
 */
const Altcha = ({ ref, challenge = "/api/altcha/desafio" }) => {
  const widgetRef = useRef(null);
  const payload = useRef("");

  useEffect(() => {
    const widget = widgetRef.current;
    const aoMudar = (evento) => {
      const { state, payload: valor } = evento.detail ?? {};
      payload.current = state === "verified" ? valor : "";
    };
    widget.addEventListener("statechange", aoMudar);
    return () => widget.removeEventListener("statechange", aoMudar);
  }, []);

  useImperativeHandle(ref, () => ({
    async obterDados() {
      return { altcha: payload.current };
    },
    reiniciar() {
      // Cada desafio vale uma vez só: desmarca para buscar outro
      payload.current = "";
      widgetRef.current?.reset();
    },
  }));

  return (
    <div className="captcha-widget">
      <altcha-widget ref={widgetRef} challenge={challenge} language="pt-br" />
    </div>
  );
};

export default Altcha;
