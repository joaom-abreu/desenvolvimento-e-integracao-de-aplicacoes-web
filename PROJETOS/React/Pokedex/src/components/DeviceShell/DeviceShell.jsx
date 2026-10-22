import Icon from "../Icon/Icon";
import "./DeviceShell.css";

const LED_TEXTO = {
  off: "Favoritos desligados (Supabase não configurado)",
  loading: "Carregando favoritos",
  saving: "Salvando favorito",
  ok: "Favoritos sincronizados",
  error: "Erro ao falar com o Supabase",
};

/**
 * O aparelho da Pokédex, desenhado só com CSS: carcaça de plástico, sensor,
 * LED de sincronização, botões físicos, tela de vidro, alto-falante e parafusos.
 *
 * - O LED mostra o estado dos favoritos no Supabase.
 * - "Noturno" troca a luz da tela (tema claro/escuro).
 * - "Sortear" abre um Pokémon aleatório (o sensor faz uma varredura).
 * - "Fechar" fecha a tampa (a capa PokedexCover volta). bootKey muda a cada vez que
 *   a Pokédex liga, e a tela faz a animação de "ligar" de novo.
 */
export default function DeviceShell({
  theme,
  onToggleTheme,
  onRandom,
  onPowerOff,
  ledStatus,
  bootKey = 0,
  scanKey,
  children,
}) {
  const noturno = theme === "dark";

  return (
    <div className="desk">
      <div className="device">
        <span className="device__grip device__grip--left" aria-hidden="true" />
        <span className="device__grip device__grip--right" aria-hidden="true" />

        <header className="device__top">
          <div className="device__sensor" aria-hidden="true">
            <span key={scanKey} className="device__sweep" />
          </div>

          <h1 className="device__brand">Pokédex</h1>

          <span className="device__led" title={LED_TEXTO[ledStatus]} aria-hidden="true">
            <span className="led" data-status={ledStatus} />
          </span>

          <div className="device__controls">
            <button
              type="button"
              className="hw-button hw-button--rubber"
              aria-pressed={noturno}
              aria-label="Modo noturno"
              title="Modo noturno"
              onClick={onToggleTheme}
            >
              <Icon name={noturno ? "moon" : "sun"} />
              <span className="hw-button__label">Noturno</span>
            </button>
            <button
              type="button"
              className="hw-button hw-button--rubber"
              aria-label="Fechar a Pokédex"
              title="Fechar a Pokédex"
              onClick={onPowerOff}
            >
              <Icon name="power" />
              <span className="hw-button__label">Fechar</span>
            </button>
            <button
              type="button"
              className="hw-button hw-button--accent"
              aria-label="Sortear um Pokémon"
              title="Sortear um Pokémon"
              onClick={onRandom}
            >
              <Icon name="dice" />
              <span className="hw-button__label">Sortear</span>
            </button>
          </div>
        </header>

        <div className="device__bezel">
          <div
            className="device__screen"
            data-boot={bootKey > 0 ? (bootKey % 2 ? "a" : "b") : undefined}
          >
            {children}
          </div>
        </div>

        <footer className="device__bottom" aria-hidden="true">
          <span className="screw" />
          <span className="device__speaker" />
          <span className="device__engraving">Kanto 151</span>
          <span className="screw" />
        </footer>
      </div>
    </div>
  );
}
