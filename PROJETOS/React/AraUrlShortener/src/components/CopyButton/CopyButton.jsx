import { useEffect, useState } from "react";
import { LuCheck, LuCopy } from "react-icons/lu";
import { copyToClipboard } from "../../utils/clipboard";

/**
 * Botão "Copiar" com confirmação ("Copiado!") por alguns segundos.
 * iconOnly = só o ícone (usado no histórico).
 */
function CopyButton({ text, label = "Copiar", className = "btn", iconOnly = false }) {
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    if (!copiado) return;
    const timer = setTimeout(() => setCopiado(false), 1800);
    return () => clearTimeout(timer);
  }, [copiado]);

  const copiar = async () => {
    if (await copyToClipboard(text)) setCopiado(true);
  };

  const Icone = copiado ? LuCheck : LuCopy;
  const rotulo = copiado ? "Copiado!" : label;

  return (
    <button
      type="button"
      className={`${className}${copiado ? " is-copied" : ""}`}
      onClick={copiar}
      aria-label={iconOnly ? `${label}: ${text}` : undefined}
      title={iconOnly ? rotulo : undefined}
    >
      <Icone aria-hidden="true" />
      {!iconOnly && <span>{rotulo}</span>}
      <span className="sr-only" aria-live="polite">
        {copiado ? "Link copiado" : ""}
      </span>
    </button>
  );
}

export default CopyButton;
