import { pdf } from "@react-pdf/renderer";
import { createElement } from "react";
import { DS_INFO } from "../config/designSystem";
import DesignSystemPdf from "./DesignSystemPdf";

/**
 * Gera o PDF do design system no navegador e dispara o download.
 * Este arquivo (e o @react-pdf/renderer) só é baixado quando alguém clica
 * em "Baixar em PDF" na página /design (import dinâmico).
 */
export const baixarDesignSystemPdf = async () => {
  const blob = await pdf(createElement(DesignSystemPdf)).toBlob();
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = DS_INFO.arquivoPdf;
  document.body.appendChild(link);
  link.click();
  link.remove();

  // Dá tempo ao navegador de começar o download antes de liberar a memória
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
};
