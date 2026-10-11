import { useEffect, useRef, useState } from "react";
import { FiDownload, FiExternalLink, FiMaximize2, FiZoomIn, FiZoomOut } from "react-icons/fi";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import CURRICULUM_CONFIG from "../../config/curriculumConfig";
import "./CurriculumViewer.css";

// O PDF.js lê o PDF num "worker" (outra thread), para não travar a página.
// O worker sai do próprio build (?url), sem depender de CDN. Pelo README do
// react-pdf, ele precisa ser configurado no MESMO arquivo que usa <Document>.
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

const { FILES, ZOOM_MIN, ZOOM_MAX, ZOOM_STEP } = CURRICULUM_CONFIG;

/**
 * Visualizador de currículo em PDF com react-pdf (PDF.js):
 * troca de idioma, zoom, contagem de páginas, baixar e abrir em nova aba.
 * O texto do PDF continua selecionável e os links continuam clicáveis.
 *
 * <CurriculumViewer />
 * <CurriculumViewer files={[{ id: "pt", label: "PT", file: "/meu-cv.pdf", downloadName: "cv.pdf" }]} />
 */
export default function CurriculumViewer({ files = FILES }) {
  const areaRef = useRef(null);
  const [current, setCurrent] = useState(files[0]);
  const [pages, setPages] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [width, setWidth] = useState(null);
  const [error, setError] = useState(false);

  // Com zoom 100%, a página ocupa a largura da área (acompanha a janela)
  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.max(240, Math.floor(entry.contentRect.width)))
    );
    observer.observe(area);
    return () => observer.disconnect();
  }, []);

  const changeFile = (file) => {
    if (file.id === current.id) return;
    setCurrent(file);
    setPages(0);
    setError(false);
  };

  const changeZoom = (delta) =>
    setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +(z + delta).toFixed(2))));

  const pageWidth = width ? Math.round(Math.min(width, 900) * zoom) : undefined;
  const loading = !error && pages === 0;

  return (
    <div className="cv-viewer">
      {/* ---------- Barra de ferramentas ---------- */}
      <div className="cv-toolbar">
        <div className="cv-toolbar-left">
          {files.length > 1 && (
            <div className="cv-langs" role="group" aria-label="Idioma do currículo">
              {files.map((file) => (
                <button
                  key={file.id}
                  type="button"
                  className={file.id === current.id ? "active" : ""}
                  aria-pressed={file.id === current.id}
                  onClick={() => changeFile(file)}
                >
                  {file.label}
                </button>
              ))}
            </div>
          )}
          {pages > 0 && (
            <span className="cv-pages">
              {pages} {pages === 1 ? "página" : "páginas"}
            </span>
          )}
        </div>

        <div className="cv-zoom" role="group" aria-label="Zoom">
          <button type="button" onClick={() => changeZoom(-ZOOM_STEP)} disabled={zoom <= ZOOM_MIN} title="Diminuir">
            <FiZoomOut aria-hidden="true" />
            <span className="cv-sr">Diminuir zoom</span>
          </button>
          <span className="cv-zoom-value" aria-live="polite">
            {Math.round(zoom * 100)}%
          </span>
          <button type="button" onClick={() => changeZoom(ZOOM_STEP)} disabled={zoom >= ZOOM_MAX} title="Aumentar">
            <FiZoomIn aria-hidden="true" />
            <span className="cv-sr">Aumentar zoom</span>
          </button>
          <button type="button" onClick={() => setZoom(1)} disabled={zoom === 1} title="Ajustar à largura">
            <FiMaximize2 aria-hidden="true" />
            <span className="cv-sr">Ajustar à largura</span>
          </button>
        </div>

        <div className="cv-actions">
          <a className="cv-button primary" href={current.file} download={current.downloadName}>
            <FiDownload aria-hidden="true" /> Baixar PDF
          </a>
          <a className="cv-button" href={current.file} target="_blank" rel="noopener noreferrer">
            <FiExternalLink aria-hidden="true" /> Abrir
          </a>
        </div>
      </div>

      {/* ---------- Páginas ---------- */}
      <div className="cv-area" ref={areaRef}>
        {loading && (
          <p className="cv-status" role="status">
            <span className="cv-spinner" aria-hidden="true" /> Carregando currículo...
          </p>
        )}

        {error ? (
          // Falha de rede ou navegador antigo: os botões acima continuam funcionando
          <p className="cv-status cv-error">
            Não foi possível exibir o PDF aqui. Use os botões <strong>Baixar PDF</strong> ou <strong>Abrir</strong>.
          </p>
        ) : (
          <Document
            key={current.file}
            file={current.file}
            onLoadSuccess={({ numPages }) => setPages(numPages)}
            onLoadError={(err) => {
              console.error("Currículo: falha ao abrir o PDF", err);
              setError(true);
            }}
            loading={null}
            error={null}
            externalLinkTarget="_blank"
            externalLinkRel="noopener noreferrer"
          >
            {pageWidth &&
              Array.from({ length: pages }, (_, i) => (
                <div key={i} className="cv-page">
                  <Page pageNumber={i + 1} width={pageWidth} loading={null} />
                </div>
              ))}
          </Document>
        )}
      </div>
    </div>
  );
}
