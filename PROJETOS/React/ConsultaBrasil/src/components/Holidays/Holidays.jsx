import { useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight, FiDownload } from "react-icons/fi";
import { formatLongDate, monthName, plural, weekdayName } from "../../core/format";
import { BREAK_LABELS, bridgeDay, buildIcs, enrichHolidays, nextHoliday, summarize } from "../../core/holidays";
import useRequest from "../../hooks/useRequest";
import { getHolidays } from "../../services/brasilApiService";
import { downloadText } from "../../utils/download";
import SourceInfo from "../ui/SourceInfo";
import Spinner from "../ui/Spinner";
import StatusMessage from "../ui/StatusMessage";
import "./Holidays.css";

// A BrasilAPI aceita de 1900 a 2199
const MIN_YEAR = 1900;
const MAX_YEAR = 2199;

const countdown = (days) => (days === 0 ? "É hoje" : days === 1 ? "É amanhã" : `Faltam ${days} dias`);

/** Feriados nacionais do ano, com feriadões e contagem regressiva. */
export default function Holidays() {
  const thisYear = new Date().getFullYear();
  const [year, setYearState] = useState(thisYear);
  const [yearText, setYearText] = useState(String(thisYear)); // o que está no campo, mesmo incompleto
  const setYear = (y) => {
    setYearState(y);
    setYearText(String(y));
  };
  const [hidePast, setHidePast] = useState(false);

  const request = useRequest((signal) => getHolidays(year, { signal }), year, { keepPrevious: true });

  const holidays = useMemo(() => (request.data ? enrichHolidays(request.data.data) : []), [request.data]);
  const stats = useMemo(() => summarize(holidays), [holidays]);
  const next = year === thisYear ? nextHoliday(holidays) : null;
  const visible = hidePast ? holidays.filter((h) => !h.isPast) : holidays;

  const months = useMemo(() => {
    const groups = new Map();
    visible.forEach((h) => groups.set(h.month, [...(groups.get(h.month) ?? []), h]));
    return [...groups.entries()];
  }, [visible]);

  const changeYear = (delta) => setYear(Math.min(MAX_YEAR, Math.max(MIN_YEAR, year + delta)));

  const download = () =>
    downloadText(buildIcs(holidays, year), `feriados-nacionais-${year}.ics`, "text/calendar;charset=utf-8");

  return (
    <div className="cb-stack">
      <section className="cb-card holidays-bar">
        <div className="holidays-year" role="group" aria-label="Ano">
          <button type="button" className="cb-icon-button" onClick={() => changeYear(-1)} aria-label="Ano anterior">
            <FiChevronLeft />
          </button>
          <input
            type="number"
            min={MIN_YEAR}
            max={MAX_YEAR}
            value={yearText}
            aria-label="Ano"
            onChange={(e) => {
              setYearText(e.target.value);
              const y = Number(e.target.value);
              if (y >= MIN_YEAR && y <= MAX_YEAR) setYearState(y);
            }}
            onBlur={() => setYearText(String(year))}
          />
          <button type="button" className="cb-icon-button" onClick={() => changeYear(1)} aria-label="Próximo ano">
            <FiChevronRight />
          </button>
          {year !== thisYear && (
            <button type="button" className="cb-link-button" onClick={() => setYear(thisYear)}>
              Voltar para {thisYear}
            </button>
          )}
          {request.status === "loading" && <Spinner label="Carregando feriados" />}
        </div>

        <div className="cb-head-actions">
          {year === thisYear && (
            <label className="cb-check">
              <input type="checkbox" checked={hidePast} onChange={(e) => setHidePast(e.target.checked)} />
              Esconder os que já passaram
            </label>
          )}
          <button type="button" className="cb-button is-small" onClick={download} disabled={holidays.length === 0}>
            <FiDownload aria-hidden="true" /> Baixar para a agenda (.ics)
          </button>
        </div>
      </section>

      {request.status === "error" && <StatusMessage error={request.error} onRetry={request.retry} />}

      {holidays.length > 0 && (
        <>
          <div className="holidays-top">
            {next && (
              <section className="holidays-next" aria-label="Próximo feriado">
                <div className="holidays-next-date">
                  <span>{next.dateObj.getDate()}</span>
                  <small>{monthName(next.month).slice(0, 3)}</small>
                </div>
                <div>
                  <p className="holidays-next-label">Próximo feriado</p>
                  <h3>{next.name}</h3>
                  <p>
                    {weekdayName(next.dateObj)}, {formatLongDate(next.date)}. <strong>{countdown(next.daysUntil)}</strong>
                  </p>
                  <p className="holidays-next-tip">{BREAK_LABELS[next.kind]}{next.kind === "bridge" && `: enforque ${bridgeDay(next.dateObj)}`}.</p>
                </div>
              </section>
            )}

            <dl className="holidays-stats">
              <div>
                <dt>Feriados nacionais</dt>
                <dd>{stats.total}</dd>
              </div>
              <div>
                <dt>Em dia útil</dt>
                <dd>{stats.onWeekdays}</dd>
              </div>
              <div>
                <dt>Feriadões de 3 dias</dt>
                <dd>{stats.longWeekends}</dd>
              </div>
              <div>
                <dt>Dá para enforcar</dt>
                <dd>{stats.bridges}</dd>
              </div>
              <div className="holidays-stats-wide">
                <dt>Dias úteis em {year}</dt>
                <dd>{stats.businessDays}</dd>
              </div>
            </dl>
          </div>

          <section className="cb-card">
            <div className="cb-card-head">
              <div>
                <h3>Feriados de {year}</h3>
                <p className="cb-card-note">
                  Só os nacionais. Feriados estaduais e municipais variam e não estão na BrasilAPI.
                </p>
              </div>
            </div>

            {months.length === 0 ? (
              <p className="cb-muted">Todos os feriados de {year} já passaram.</p>
            ) : (
              <ol className="holidays-months">
                {months.map(([month, list]) => (
                  <li key={month}>
                    <h4>{monthName(month)}</h4>
                    <ul className="holidays-list">
                      {list.map((h) => (
                        <li key={h.date} className={`${h.isPast ? "is-past" : ""} ${next?.date === h.date ? "is-next" : ""}`}>
                          <span className="holidays-day">{h.dateObj.getDate()}</span>
                          <div className="holidays-info">
                            <strong>{h.name}</strong>
                            <span>
                              {weekdayName(h.dateObj)}
                              {!h.isPast && year === thisYear && h.daysUntil > 0 && `, em ${plural(h.daysUntil, "dia", "dias")}`}
                            </span>
                          </div>
                          <span className={`cb-badge is-kind-${h.kind}`}>
                            {BREAK_LABELS[h.kind]}
                            {h.kind === "bridge" && ` ${bridgeDay(h.dateObj)}`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            )}
            <SourceInfo result={request.data} />
          </section>
        </>
      )}
    </div>
  );
}
