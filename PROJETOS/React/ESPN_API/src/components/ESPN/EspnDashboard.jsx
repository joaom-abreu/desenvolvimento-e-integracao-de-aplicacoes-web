import { useState } from "react";
import { IoBasketball, IoFootball } from "react-icons/io5";
import ESPN_CONFIG from "../../config/espnConfig";
import Basquete from "./Basquete";
import Futebol from "./Futebol";
import "./ESPN.css";

/**
 * Painel com as duas abas: Futebol e Basquete (NBA).
 * Cada aba também funciona sozinha: <Futebol /> e <Basquete />.
 *
 * Para usar no seu projeto, copie:
 *   • a pasta components/ESPN
 *   • services/espnService.js e config/espnConfig.js
 *
 * <EspnDashboard />
 * <EspnDashboard initialSport="basquete" />
 */

const SPORTS = [
  { key: "futebol", label: "Futebol", icon: IoFootball },
  { key: "basquete", label: "Basquete", icon: IoBasketball },
];

export default function EspnDashboard({ initialSport = ESPN_CONFIG.DEFAULT_SPORT }) {
  const [sport, setSport] = useState(initialSport);
  // Uma aba só começa a buscar dados quando é aberta pela primeira vez
  const [opened, setOpened] = useState(() => new Set([initialSport]));

  const open = (key) => {
    setSport(key);
    setOpened((old) => new Set(old).add(key));
  };

  return (
    <div className="espn">
      <div className="espn-tabs" role="tablist" aria-label="Esporte">
        {SPORTS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={sport === key}
            className={sport === key ? "active" : ""}
            onClick={() => open(key)}
          >
            <Icon aria-hidden="true" />
            {label}
          </button>
        ))}
      </div>

      {/* Depois de aberta, a aba fica montada: voltar para ela não busca tudo de novo */}
      {opened.has("futebol") && (
        <div hidden={sport !== "futebol"}>
          <Futebol />
        </div>
      )}
      {opened.has("basquete") && (
        <div hidden={sport !== "basquete"}>
          <Basquete />
        </div>
      )}
    </div>
  );
}

// Ícone da faixa azul: bola de futebol + bola de basquete
export function EspnIcon({ className }) {
  return (
    <span className={`${className ?? ""} espn-hero-icons`} aria-hidden="true">
      <IoFootball />
      <IoBasketball />
    </span>
  );
}
