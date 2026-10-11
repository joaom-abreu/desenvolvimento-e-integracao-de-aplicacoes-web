import { useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import {
  FiCalendar,
  FiCheckCircle,
  FiCode,
  FiFileText,
  FiGlobe,
  FiHash,
  FiList,
  FiMinus,
  FiPlus,
  FiType,
  FiUser,
} from "react-icons/fi";
import I18N_CONFIG from "../../config/i18nConfig";
import "./I18nDemo.css";

/**
 * Vitrine dos recursos do i18next: cada cartão mostra um recurso funcionando,
 * o código que o usa e o texto que está no translation.json do idioma atual.
 */

// Texto cru do JSON do idioma atual (ex.: "{{count}} disciplinas na grade")
function useRaw() {
  const { i18n } = useTranslation();
  const lng = i18n.resolvedLanguage;
  return (key) => i18n.getResource(lng, "translation", key);
}

// "Ver código": o trecho em React + as linhas do translation.json
function CodeBlock({ code, json }) {
  const { t, i18n } = useTranslation();
  return (
    <details className="i18n-code">
      <summary>
        <FiCode aria-hidden="true" /> {t("code.show")}
      </summary>
      <pre>
        <code>{code}</code>
      </pre>
      {json && (
        <>
          <span className="i18n-code-file">{t("code.json", { lng: i18n.resolvedLanguage })}</span>
          <pre>
            <code>{JSON.stringify(json, null, 2)}</code>
          </pre>
        </>
      )}
    </details>
  );
}

function Card({ icon: Icon, title, desc, code, json, children, wide = false }) {
  return (
    <section className={`i18n-card ${wide ? "wide" : ""}`}>
      <h3>
        <Icon aria-hidden="true" />
        {title}
      </h3>
      <p className="i18n-desc">{desc}</p>
      <div className="i18n-demo">{children}</div>
      <CodeBlock code={code} json={json} />
    </section>
  );
}

/* =====================================================================
   Idioma atual
   ===================================================================== */

function CurrentLanguage() {
  const { t, i18n } = useTranslation();
  const lng = i18n.resolvedLanguage;
  const language = I18N_CONFIG.LANGUAGES.find((l) => l.code === lng);
  const Flag = language?.flag;

  let saved = null;
  try {
    saved = localStorage.getItem(I18N_CONFIG.STORAGE_KEY);
  } catch {
    // navegador sem localStorage (modo privado): segue sem
  }

  const rows = [
    [t("current.language"), language?.name ?? lng],
    [t("current.code"), <code key="c">{lng}</code>],
    [t("current.htmlLang"), <code key="h">{document.documentElement.lang}</code>],
    [
      t("current.saved"),
      saved ? t("current.savedValue", { key: I18N_CONFIG.STORAGE_KEY }) + ` = "${saved}"` : t("current.notSaved"),
    ],
    [t("current.fallback"), <code key="f">{I18N_CONFIG.FALLBACK}</code>],
  ];

  return (
    <section className="i18n-current" aria-live="polite">
      <div className="i18n-current-flag" key={lng}>{Flag && <Flag aria-hidden="true" />}</div>
      <div className="i18n-current-info">
        <span className="i18n-current-title">{t("current.title")}</span>
        <dl>
          {rows.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

/* =====================================================================
   Vitrine
   ===================================================================== */

// Valores fixos usados nos exemplos de formatação
const SAMPLE_DATE = new Date();
const SAMPLE = { value: 1234567.891, price: 1890.5, rate: 0.875, days: 3, items: ["JavaScript", "Python", "Java"] };

export default function I18nDemo() {
  const { t } = useTranslation();
  const raw = useRaw();
  const [name, setName] = useState("");
  const [count, setCount] = useState(1);

  const steps = t("cards.list.steps", { returnObjects: true });

  const formats = [
    ["date", { date: SAMPLE_DATE }],
    ["time", { date: SAMPLE_DATE }],
    ["number", { value: SAMPLE.value }],
    ["currency", { price: SAMPLE.price }],
    ["percent", { rate: SAMPLE.rate }],
    ["relative", { days: SAMPLE.days }],
    ["list", { items: SAMPLE.items }],
  ];

  return (
    <div className="i18n">
      <CurrentLanguage />

      <div className="i18n-grid">
        {/* ---------- Texto simples ---------- */}
        <Card
          icon={FiType}
          title={t("cards.simple.title")}
          desc={t("cards.simple.desc")}
          code={`const { t } = useTranslation();\n\n<h2>{t("cards.simple.welcome")}</h2>\n<p>{t("cards.simple.subtitle")}</p>`}
          json={{ welcome: raw("cards.simple.welcome"), subtitle: raw("cards.simple.subtitle") }}
        >
          <p className="i18n-big">{t("cards.simple.welcome")}</p>
          <p className="i18n-muted">{t("cards.simple.subtitle")}</p>
        </Card>

        {/* ---------- Interpolação ---------- */}
        <Card
          icon={FiUser}
          title={t("cards.interpolation.title")}
          desc={t("cards.interpolation.desc")}
          code={`t("cards.interpolation.greeting", { name })`}
          json={{ greeting: raw("cards.interpolation.greeting") }}
        >
          <label className="i18n-field">
            <span>{t("cards.interpolation.label")}</span>
            <input
              type="text"
              value={name}
              maxLength={40}
              placeholder={t("cards.interpolation.placeholder")}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <p className="i18n-output">
            {t("cards.interpolation.greeting", { name: name.trim() || t("cards.interpolation.anonymous") })}
          </p>
        </Card>

        {/* ---------- Plural ---------- */}
        <Card
          icon={FiHash}
          title={t("cards.plural.title")}
          desc={t("cards.plural.desc")}
          code={`t("cards.plural.items", { count })`}
          json={{
            items_zero: raw("cards.plural.items_zero"),
            items_one: raw("cards.plural.items_one"),
            items_other: raw("cards.plural.items_other"),
          }}
        >
          <div className="i18n-counter">
            <button
              type="button"
              onClick={() => setCount((n) => Math.max(0, n - 1))}
              disabled={count === 0}
              aria-label={t("cards.plural.remove")}
              title={t("cards.plural.remove")}
            >
              <FiMinus aria-hidden="true" />
            </button>
            <output className="i18n-output">{t("cards.plural.items", { count })}</output>
            <button
              type="button"
              onClick={() => setCount((n) => Math.min(99, n + 1))}
              aria-label={t("cards.plural.add")}
              title={t("cards.plural.add")}
            >
              <FiPlus aria-hidden="true" />
            </button>
          </div>
        </Card>

        {/* ---------- <Trans> ----------
            Cuidado com o nome das tags: <link>, <img>, <br>, <input>... são tags
            "vazias" do HTML e o <Trans> não coloca texto dentro delas.
            Por isso o link do Canvas se chama <url> no JSON. */}
        <Card
          icon={FiFileText}
          title={t("cards.trans.title")}
          desc={t("cards.trans.desc")}
          code={`<Trans\n  i18nKey="cards.trans.text"\n  components={{\n    b: <strong />,\n    i: <em />,\n    url: <a href="https://pucminas.instructure.com" />,\n  }}\n/>`}
          json={{ text: raw("cards.trans.text") }}
        >
          <p className="i18n-output">
            <Trans
              i18nKey="cards.trans.text"
              components={{
                b: <strong />,
                i: <em />,
                url: <a href="https://pucminas.instructure.com" target="_blank" rel="noopener noreferrer" />,
              }}
            />
          </p>
        </Card>

        {/* ---------- Formatação ---------- */}
        <Card
          wide
          icon={FiCalendar}
          title={t("cards.format.title")}
          desc={t("cards.format.desc")}
          code={`t("cards.format.date", { date: new Date() })\nt("cards.format.currency", { price: 1890.5 })\nt("cards.format.relative", { days: 3 })\nt("cards.format.list", { items: ["JavaScript", "Python", "Java"] })`}
          json={Object.fromEntries(formats.map(([key]) => [key, raw(`cards.format.${key}`)]))}
        >
          <dl className="i18n-formats">
            {formats.map(([key, values]) => (
              <div key={key}>
                <dt>{t(`cards.format.labels.${key}`)}</dt>
                <dd>{t(`cards.format.${key}`, values)}</dd>
              </div>
            ))}
          </dl>
        </Card>

        {/* ---------- Listas ---------- */}
        <Card
          wide
          icon={FiList}
          title={t("cards.list.title")}
          desc={t("cards.list.desc")}
          code={`const steps = t("cards.list.steps", { returnObjects: true });\n\nsteps.map((step) => <li key={step}>{step}</li>)`}
          json={{ steps: raw("cards.list.steps") }}
        >
          <ol className="i18n-steps">
            {Array.isArray(steps) &&
              steps.map((step) => (
                <li key={step}>
                  <FiCheckCircle aria-hidden="true" />
                  {step}
                </li>
              ))}
          </ol>
        </Card>
      </div>

      <p className="i18n-source">
        <FiGlobe aria-hidden="true" /> i18next · react-i18next · i18next-browser-languagedetector · country-flag-icons
      </p>
    </div>
  );
}
