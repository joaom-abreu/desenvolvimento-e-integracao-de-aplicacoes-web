import { useEffect, useState } from "react";
import { TbClick, TbEye, TbLayoutNavbar } from "react-icons/tb";
import PageLayout from "./components/PageLayout/PageLayout";
import BackgroundEffect from "./components/BackgroundEffect/BackgroundEffect";
import EffectPicker from "./components/EffectPicker/EffectPicker";
import EffectDetails from "./components/EffectDetails/EffectDetails";
import EFFECTS from "./data/effects";

// Lê o efeito do endereço (ex.: http://localhost:5173/#fitas)
const effectFromHash = () => {
  const id = window.location.hash.slice(1);
  return EFFECTS.some((effect) => effect.id === id) ? id : EFFECTS[0].id;
};

function App() {
  const [effectId, setEffectId] = useState(effectFromHash);
  const [cardHidden, setCardHidden] = useState(false);

  const effect = EFFECTS.find(({ id }) => id === effectId);

  // Mantém o #efeito no endereço, para poder compartilhar o link
  useEffect(() => {
    window.history.replaceState(null, "", `#${effectId}`);
  }, [effectId]);

  // Se o usuário trocar o # na barra de endereço, troca o efeito
  useEffect(() => {
    const onHash = () => setEffectId(effectFromHash());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Esc mostra o card de novo
  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && setCardHidden(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* key: troca de efeito = desmonta o antigo e monta o novo do zero */}
      <BackgroundEffect key={effect.id} effect={effect} />

      <div className={`stage${cardHidden ? " is-hidden" : ""}`} inert={cardHidden}>
        <PageLayout
          icon={TbClick}
          brand="React Bits"
          title="Efeitos que seguem o mouse"
          description="Cinco componentes do React Bits aplicados no fundo do site. Escolha um efeito, mova o mouse pelas laterais da página e copie o código para o seu projeto."
        >
          <EffectPicker effects={EFFECTS} value={effectId} onChange={setEffectId} />
          <EffectDetails effect={effect} />
        </PageLayout>
      </div>

      <button
        type="button"
        className="stage-toggle"
        onClick={() => setCardHidden((hidden) => !hidden)}
      >
        {cardHidden ? <TbLayoutNavbar aria-hidden="true" /> : <TbEye aria-hidden="true" />}
        {cardHidden ? "Mostrar o card" : "Ver só o fundo"}
      </button>
    </>
  );
}

export default App;
