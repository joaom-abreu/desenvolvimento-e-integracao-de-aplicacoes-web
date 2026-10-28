import { useEffect, useState } from "react";
import { FiCheck, FiCopy } from "react-icons/fi";
import { copyText } from "../../utils/clipboard";

/** Botão "Copiar" que vira "Copiado" por 2 segundos. */
export default function CopyButton({ text, label = "Copiar", className = "cb-link-button" }) {
  const [state, setState] = useState("idle");

  useEffect(() => {
    if (state === "idle") return undefined;
    const timer = setTimeout(() => setState("idle"), 2000);
    return () => clearTimeout(timer);
  }, [state]);

  const copy = async () => {
    try {
      await copyText(text);
      setState("done");
    } catch {
      setState("fail");
    }
  };

  return (
    <button type="button" className={className} onClick={copy} aria-live="polite">
      {state === "done" ? <FiCheck aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
      {state === "done" ? "Copiado" : state === "fail" ? "Não deu para copiar" : label}
    </button>
  );
}
