/**
 * Copia um texto para a área de transferência.
 * navigator.clipboard só existe em HTTPS (ou localhost); fora disso,
 * usa o truque antigo do <textarea> + execCommand("copy").
 */
export async function copyToClipboard(texto) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(texto);
      return true;
    } catch {
      // cai no plano B
    }
  }

  const campo = document.createElement("textarea");
  campo.value = texto;
  campo.setAttribute("readonly", "");
  campo.style.position = "fixed";
  campo.style.opacity = "0";
  document.body.appendChild(campo);
  campo.select();
  const ok = document.execCommand("copy");
  document.body.removeChild(campo);
  return ok;
}
