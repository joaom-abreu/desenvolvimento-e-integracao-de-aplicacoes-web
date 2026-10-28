import { FiMail, FiMapPin, FiPhone, FiUsers } from "react-icons/fi";
import { maskCnpj } from "../../core/cnpj";
import { formatDate, formatMoney, formatPhone, plural } from "../../core/format";
import { titleCase } from "../../core/text";
import CopyButton from "../ui/CopyButton";

const SITUATION_TONE = { ATIVA: "ok", BAIXADA: "bad", INAPTA: "bad", SUSPENSA: "warn", NULA: "bad" };

const yearsSince = (iso) => {
  const start = new Date(iso);
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  if (now < new Date(now.getFullYear(), start.getMonth(), start.getDate())) years--;
  return years;
};

const yesNo = (value) => (value === true ? "Sim" : value === false ? "Não" : "—");

/** Ficha da empresa, com os campos que a BrasilAPI devolve em /cnpj/v1. */
export default function CnpjResult({ company: c }) {
  const situation = c.descricao_situacao_cadastral || "—";
  // A Receita manda tudo em maiúsculas: "AVENIDA DOM JOSE GASPAR"
  const street = titleCase([c.descricao_tipo_de_logradouro, c.logradouro].filter(Boolean).join(" "));
  const addressLines = [
    [street, c.numero].filter(Boolean).join(", ") + (c.complemento ? ` – ${titleCase(c.complemento)}` : ""),
    titleCase(c.bairro || ""),
    [titleCase(c.municipio || ""), c.uf].filter(Boolean).join(" – "),
    c.cep && `CEP ${String(c.cep).replace(/^(\d{5})(\d{3})$/, "$1-$2")}`,
  ].filter(Boolean);
  const phones = [c.ddd_telefone_1, c.ddd_telefone_2].filter(Boolean).map(formatPhone);
  const partners = c.qsa ?? [];
  const secondary = (c.cnaes_secundarios ?? []).filter((x) => x.codigo);

  return (
    <article className="cb-card cnpj">
      <header className="cnpj-head">
        <div className="cnpj-names">
          <h3>{c.razao_social}</h3>
          {c.nome_fantasia && <p className="cnpj-fantasia">{c.nome_fantasia}</p>}
          <p className="cnpj-number">
            {maskCnpj(c.cnpj)}
            <CopyButton text={maskCnpj(c.cnpj)} label="Copiar" />
          </p>
        </div>
        <div className="cnpj-badges">
          <span className={`cb-badge is-${SITUATION_TONE[situation] ?? "warn"}`}>{situation}</span>
          {c.descricao_identificador_matriz_filial && (
            <span className="cb-badge">{titleCase(c.descricao_identificador_matriz_filial)}</span>
          )}
        </div>
      </header>

      <dl className="cb-facts cb-facts-grid">
        <div>
          <dt>Abertura</dt>
          <dd>
            {formatDate(c.data_inicio_atividade)}
            {c.data_inicio_atividade && <span className="cb-sub">{plural(yearsSince(c.data_inicio_atividade), "ano", "anos")}</span>}
          </dd>
        </div>
        <div>
          <dt>Situação desde</dt>
          <dd>{formatDate(c.data_situacao_cadastral) || "—"}</dd>
        </div>
        <div>
          <dt>Porte</dt>
          <dd>{c.porte ? titleCase(c.porte) : "—"}</dd>
        </div>
        <div>
          <dt>Capital social</dt>
          <dd>{c.capital_social != null ? formatMoney(c.capital_social) : "—"}</dd>
        </div>
        <div className="cb-span-2">
          <dt>Natureza jurídica</dt>
          <dd>{c.natureza_juridica || "—"}</dd>
        </div>
        <div>
          <dt>Simples Nacional</dt>
          <dd>{yesNo(c.opcao_pelo_simples)}</dd>
        </div>
        <div>
          <dt>MEI</dt>
          <dd>{yesNo(c.opcao_pelo_mei)}</dd>
        </div>
      </dl>

      <section className="cnpj-section">
        <h4>Atividade principal</h4>
        <p>
          <code>{c.cnae_fiscal}</code> {c.cnae_fiscal_descricao}
        </p>
        {secondary.length > 0 && (
          <details className="cnpj-more">
            <summary>{plural(secondary.length, "atividade secundária", "atividades secundárias")}</summary>
            <ul>
              {secondary.map((s) => (
                <li key={s.codigo}>
                  <code>{s.codigo}</code> {s.descricao}
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>

      <div className="cnpj-two">
        <section className="cnpj-section">
          <h4>
            <FiMapPin aria-hidden="true" /> Endereço
          </h4>
          <address>
            {addressLines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </address>
        </section>

        <section className="cnpj-section">
          <h4>
            <FiPhone aria-hidden="true" /> Contato
          </h4>
          {phones.length === 0 && !c.email && <p className="cb-muted">Sem contato público.</p>}
          {phones.map((p) => (
            <p key={p}>{p}</p>
          ))}
          {c.email && (
            <p className="cb-break">
              <FiMail aria-hidden="true" /> {c.email.toLowerCase()}
            </p>
          )}
        </section>
      </div>

      <section className="cnpj-section">
        <h4>
          <FiUsers aria-hidden="true" /> Quadro de sócios
        </h4>
        {partners.length === 0 ? (
          <p className="cb-muted">A Receita não informa sócios para esta empresa.</p>
        ) : (
          <ul className="cnpj-partners">
            {partners.map((p, i) => (
              <li key={`${p.nome_socio}-${i}`}>
                <strong>{titleCase(p.nome_socio)}</strong>
                <span>{p.qualificacao_socio}</span>
                {p.data_entrada_sociedade && <span className="cb-sub">Desde {formatDate(p.data_entrada_sociedade)}</span>}
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}
