import "./EffectPicker.css";

/**
 * Botões para escolher o efeito (mesmo visual do filtro do SkillsGlobe).
 */
const EffectPicker = ({ effects, value, onChange }) => (
  <div className="effect-picker" role="radiogroup" aria-label="Escolha o efeito">
    {effects.map(({ id, label, icon: Icon }) => {
      const active = id === value;

      return (
        <button
          key={id}
          type="button"
          role="radio"
          aria-checked={active}
          className={`effect-pill${active ? " is-active" : ""}`}
          onClick={() => onChange(id)}
        >
          <Icon aria-hidden="true" />
          {label}
        </button>
      );
    })}
  </div>
);

export default EffectPicker;
