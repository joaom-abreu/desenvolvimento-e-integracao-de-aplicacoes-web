import { useState } from "react";
import { FiEdit3, FiSearch } from "react-icons/fi";
import PayloadBreakdown from "./PayloadBreakdown";
import PixForm from "./PixForm";
import PixReader from "./PixReader";
import PixResult from "./PixResult";
import usePixGenerator from "./usePixGenerator";
import "./PixGenerator.css";

const TABS = [
  { id: "generate", label: "Gerar Pix", icon: FiEdit3 },
  { id: "read", label: "Ler código", icon: FiSearch },
];

/**
 * Painel completo: abas "Gerar Pix" (formulário + QR Code + campos)
 * e "Ler código" (confere um Pix copia e cola).
 */
export default function PixGenerator() {
  const [tab, setTab] = useState("generate");
  const pix = usePixGenerator();

  return (
    <div className="pix">
      <div className="pix-tabs" role="tablist" aria-label="Modo">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`tab-${id}`}
            aria-selected={tab === id}
            aria-controls={`panel-${id}`}
            className={tab === id ? "is-active" : ""}
            onClick={() => setTab(id)}
          >
            <Icon aria-hidden="true" /> {label}
          </button>
        ))}
      </div>

      <div role="tabpanel" id="panel-generate" aria-labelledby="tab-generate" hidden={tab !== "generate"}>
        <div className="pix-stack">
          <div className="pix-columns">
            <PixForm {...pix} />
            <PixResult
              result={pix.result}
              emptyText="Preencha a chave, o nome e a cidade: o QR Code e o código copia e cola aparecem aqui."
            />
          </div>
          {pix.result && <PayloadBreakdown payload={pix.result.payload} />}
        </div>
      </div>

      <div role="tabpanel" id="panel-read" aria-labelledby="tab-read" hidden={tab !== "read"}>
        <PixReader />
      </div>
    </div>
  );
}
