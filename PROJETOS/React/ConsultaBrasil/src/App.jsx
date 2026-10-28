import { useState } from "react";
import { FiBriefcase, FiCalendar, FiHome, FiPhone, FiSearch } from "react-icons/fi";
import AddressForm from "./components/AddressForm/AddressForm";
import CepSearch from "./components/CepSearch/CepSearch";
import CnpjLookup from "./components/CnpjLookup/CnpjLookup";
import DddLookup from "./components/DddLookup/DddLookup";
import Holidays from "./components/Holidays/Holidays";
import PageLayout from "./components/PageLayout/PageLayout";
import useHashTab from "./hooks/useHashTab";
import "./components/ui/ui.css";

const TABS = [
  { id: "endereco", label: "Endereço", icon: FiHome },
  { id: "buscar-cep", label: "Buscar CEP", icon: FiSearch },
  { id: "cnpj", label: "CNPJ", icon: FiBriefcase },
  { id: "feriados", label: "Feriados", icon: FiCalendar },
  { id: "ddd", label: "DDD", icon: FiPhone },
];
const IDS = TABS.map((t) => t.id);

function App() {
  const [tab, setTab] = useHashTab(IDS, "endereco");
  // Uma aba só é montada (e só chama a API) na primeira vez que é aberta.
  // Depois ela fica escondida, mas guarda o que você digitou.
  const [visited, setVisited] = useState(() => new Set([tab]));
  if (!visited.has(tab)) setVisited(new Set([...visited, tab]));

  // Ponte entre as abas "Endereço" e "Buscar CEP"
  const [searchPreset, setSearchPreset] = useState(null);
  const [incomingAddress, setIncomingAddress] = useState(null);

  const findCep = (preset) => {
    setSearchPreset({ ...preset });
    setTab("buscar-cep");
  };
  const applyAddress = (address) => {
    setIncomingAddress({ ...address });
    setTab("endereco");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const panels = {
    endereco: <AddressForm incoming={incomingAddress} onFindCep={findCep} />,
    "buscar-cep": <CepSearch preset={searchPreset} onUse={applyAddress} />,
    cnpj: <CnpjLookup />,
    feriados: <Holidays />,
    ddd: <DddLookup />,
  };

  return (
    <PageLayout
      title="Consulta Brasil"
      description="Endereço pelo CEP, CEP pelo endereço, empresas pelo CNPJ, feriados nacionais e DDDs, direto das APIs públicas ViaCEP, BrasilAPI e IBGE."
    >
      <div className="cb">
        <nav className="cb-tabs" role="tablist" aria-label="Consultas">
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
        </nav>

        {TABS.map(({ id }) => (
          <div key={id} role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`} hidden={tab !== id}>
            {visited.has(id) && panels[id]}
          </div>
        ))}
      </div>
    </PageLayout>
  );
}

export default App;
