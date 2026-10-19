import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Link } from "react-router";
import PDF_CONFIG from "../config/pdfConfig";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import "./CardapioPdf.css";

// Leitor do cardápio impresso com o react-pdf (PDF.js 5, mantido e sem a falha
// CVE-2024-4367 do PDF.js 3 que o @react-pdf-viewer usava). Esta página, o
// react-pdf e o PDF.js só são baixados quando alguém abre /cardapio/pdf
// (App.jsx usa lazy). O worker do PDF.js sai do próprio build: o sufixo ?url
// faz o Vite copiar o arquivo e devolver o endereço dele. O worker precisa ser
// configurado neste mesmo arquivo, onde os componentes do react-pdf são usados
// (ver o README do react-pdf).
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2;
const ZOOM_PASSO = 0.25;

const CardapioPdf = () => {
  const areaRef = useRef(null);
  const [largura, setLargura] = useState(null);
  const [paginas, setPaginas] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [erro, setErro] = useState(false);

  // Com zoom 100%, a página ocupa a largura da área (acompanha a janela)
  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    // Largura útil da área, sem o padding (a margem em volta das páginas)
    const medir = (valor) => setLargura(Math.max(200, Math.floor(valor)));
    if (!("ResizeObserver" in window)) {
      const estilo = getComputedStyle(area);
      medir(area.clientWidth - parseFloat(estilo.paddingLeft) - parseFloat(estilo.paddingRight));
      return;
    }
    const observer = new ResizeObserver(([entry]) => medir(entry.contentRect.width));
    observer.observe(area);
    return () => observer.disconnect();
  }, []);

  const mudarZoom = (delta) =>
    setZoom((atual) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, atual + delta)));

  const larguraDaPagina = largura ? Math.round(largura * zoom) : undefined;
  const carregando = !erro && paginas === 0;

  return (
    <div className="container cardapio-pdf">
      <header className="cardapio-pdf-topo">
        <div>
          <h1 className="titulo-pagina">Cardápio impresso</h1>
          <p className="texto-apoio">
            A mesma folha que fica no balcão. Os preços do dia, com o que está esgotado, ficam no{" "}
            <Link to="/cardapio">cardápio do site</Link>.
          </p>
        </div>
      </header>

      <div className="cardapio-pdf-leitor">
        <div className="cardapio-pdf-barra">
          <span className="cardapio-pdf-titulo">
            {PDF_CONFIG.NOME_ARQUIVO}
            {paginas > 0 && (
              <span className="cardapio-pdf-paginas">
                {paginas} {paginas === 1 ? "página" : "páginas"}
              </span>
            )}
          </span>

          <div className="cardapio-pdf-zoom" role="group" aria-label="Zoom">
            <button
              type="button"
              onClick={() => mudarZoom(-ZOOM_PASSO)}
              disabled={zoom <= ZOOM_MIN}
              aria-label="Diminuir zoom"
              title="Diminuir zoom"
            >
              −
            </button>
            <span className="cardapio-pdf-zoom-valor" aria-live="polite">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => mudarZoom(ZOOM_PASSO)}
              disabled={zoom >= ZOOM_MAX}
              aria-label="Aumentar zoom"
              title="Aumentar zoom"
            >
              +
            </button>
            <button
              type="button"
              onClick={() => setZoom(1)}
              disabled={zoom === 1}
              aria-label="Ajustar à largura"
              title="Ajustar à largura"
            >
              ↔
            </button>
          </div>

          <div className="cardapio-pdf-acoes">
            <a
              className="btn btn-primario btn-pequeno"
              href={PDF_CONFIG.CARDAPIO_URL}
              download={PDF_CONFIG.NOME_ARQUIVO}
            >
              Baixar PDF
            </a>
            <a
              className="btn btn-secundario btn-pequeno"
              href={PDF_CONFIG.CARDAPIO_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir em nova aba
            </a>
          </div>
        </div>

        <div className="cardapio-pdf-area" ref={areaRef}>
          {carregando && (
            <p className="cardapio-pdf-aviso" role="status">
              <span className="cardapio-pdf-spinner" aria-hidden="true" />
              Abrindo o cardápio…
            </p>
          )}
          {erro ? (
            // Arquivo ausente, navegador antigo ou falha de rede: os botões acima continuam valendo
            <div className="cardapio-pdf-erro">
              <strong>O PDF não abriu.</strong>
              <span>
                Confira se o arquivo existe em public{PDF_CONFIG.CARDAPIO_URL} ou baixe pelo botão acima.
              </span>
            </div>
          ) : (
            <Document
              file={PDF_CONFIG.CARDAPIO_URL}
              onLoadSuccess={({ numPages }) => setPaginas(numPages)}
              onLoadError={(error) => {
                console.error("Cardápio: falha ao abrir o PDF", error);
                setErro(true);
              }}
              loading={null}
              error={null}
              externalLinkTarget="_blank"
              externalLinkRel="noopener noreferrer"
            >
              {larguraDaPagina &&
                Array.from({ length: paginas }, (_, i) => (
                  <div key={i} className="cardapio-pdf-pagina">
                    <Page pageNumber={i + 1} width={larguraDaPagina} loading={null} />
                  </div>
                ))}
            </Document>
          )}
        </div>
      </div>
    </div>
  );
};

export default CardapioPdf;
