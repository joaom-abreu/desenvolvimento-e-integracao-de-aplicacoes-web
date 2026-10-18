// clipboard.js
// Copia um texto. Em http:// (sem HTTPS) o navigator.clipboard não existe,
// então cai no jeito antigo com um <textarea> escondido.

export async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  const ok = document.execCommand("copy");
  area.remove();
  if (!ok) throw new Error("Não foi possível copiar.");
}
