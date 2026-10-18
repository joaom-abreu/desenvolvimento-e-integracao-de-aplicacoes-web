// download.js
// Baixa o QR Code (um <svg> já desenhado na tela) como SVG ou PNG.

function saveBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function svgToText(svg) {
  const clone = svg.cloneNode(true);
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  return new XMLSerializer().serializeToString(clone);
}

export function downloadSvg(svg, fileName) {
  saveBlob(new Blob([svgToText(svg)], { type: "image/svg+xml" }), fileName);
}

/** Desenha o SVG num <canvas> do tamanho pedido e baixa como PNG. */
export function downloadPng(svg, fileName, size) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(new Blob([svgToText(svg)], { type: "image/svg+xml" }));

    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d");
      context.imageSmoothingEnabled = false; // módulos do QR com bordas nítidas
      context.drawImage(image, 0, 0, size, size);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("Não foi possível gerar o PNG."));
        saveBlob(blob, fileName);
        resolve();
      }, "image/png");
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Não foi possível gerar o PNG."));
    };
    image.src = url;
  });
}
