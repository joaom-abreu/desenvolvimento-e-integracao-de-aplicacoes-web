import { useState } from "react";
import { FiGlobe, FiGrid } from "react-icons/fi";
import SkillsGlobe from "../SkillsGlobe/SkillsGlobe";
import "./SkillsSection.css";

/**
 * Seção completa de habilidades: filtro por categoria + alternância
 * entre o globo 3D e uma lista em grade (mais acessível e boa para celular).
 *
 * <SkillsSection skills={SKILLS} categories={CATEGORIES} />
 */
export default function SkillsSection({ skills, categories }) {
  const [category, setCategory] = useState("Todas");
  const [view, setView] = useState("globo");

  const filtered = category === "Todas" ? skills : skills.filter((s) => s.category === category);
  const count = (cat) => (cat === "Todas" ? skills.length : skills.filter((s) => s.category === cat).length);

  return (
    <div className="skills-section">
      <div className="skills-toolbar">
        <div className="skills-chips" role="group" aria-label="Categoria">
          {["Todas", ...categories].map((cat) => (
            <button
              key={cat}
              type="button"
              className={cat === category ? "active" : ""}
              aria-pressed={cat === category}
              onClick={() => setCategory(cat)}
            >
              {cat} <span>{count(cat)}</span>
            </button>
          ))}
        </div>

        <div className="skills-view" role="group" aria-label="Visualização">
          <button
            type="button"
            className={view === "globo" ? "active" : ""}
            aria-pressed={view === "globo"}
            onClick={() => setView("globo")}
          >
            <FiGlobe aria-hidden="true" /> Globo
          </button>
          <button
            type="button"
            className={view === "lista" ? "active" : ""}
            aria-pressed={view === "lista"}
            onClick={() => setView("lista")}
          >
            <FiGrid aria-hidden="true" /> Lista
          </button>
        </div>
      </div>

      {view === "globo" ? (
        <>
          {/* key: ao trocar de categoria o globo recomeça com os novos pontos */}
          <SkillsGlobe key={category} skills={filtered} />
          <p className="skills-hint">Arraste para girar · clique num ícone para abrir o link</p>
        </>
      ) : (
        <ul className="skills-grid">
          {filtered.map((skill) => {
            const Icon = skill.icon;
            return (
              <li key={skill.name}>
                <a href={skill.link} target="_blank" rel="noopener noreferrer" style={{ "--skill": skill.color }}>
                  <Icon aria-hidden="true" />
                  <span>{skill.name}</span>
                  <small>{skill.category}</small>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
