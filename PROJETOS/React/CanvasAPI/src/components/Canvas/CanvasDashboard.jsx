import { useEffect, useMemo, useState } from "react";
import { FiAlertCircle, FiBookOpen, FiCalendar, FiEdit3, FiFlag, FiRefreshCw } from "react-icons/fi";
import CANVAS_CONFIG from "../../config/canvasConfig";
import { fetchCanvas } from "../../services/canvasService";
import {
  DAY,
  decorateCourses,
  formatLongDate,
  formatNumber,
  formatTime,
  splitAssignments,
  studentStatus,
  toMs,
} from "./canvasUtils";
import { Countdown, CourseTag, OpenInCanvas, useNow } from "./Parts";
import { AgendaSection, SummarySection, TasksSection } from "./Sections";
import "./Canvas.css";

/**
 * Painel do Canvas: cursos, tarefas, prazos, entregas e eventos do calendário.
 *
 * Funciona para PROFESSOR (mostra quantos entregaram e quantas entregas
 * esperam correção) e para ALUNO (mostra se você já entregou cada tarefa).
 *
 * Para usar no seu projeto, copie:
 *   • a pasta components/Canvas
 *   • services/canvasService.js e config/canvasConfig.js
 *   • api/_canvas.js, api/canvas.js e o plugin do vite.config.js
 *
 * <CanvasDashboard />
 * <CanvasDashboard initialSection="agenda" />
 */

const SECTIONS = [
  { key: "resumo", label: "Resumo" },
  { key: "tarefas", label: "Tarefas" },
  { key: "agenda", label: "Agenda" },
];

// Busca ao abrir e de novo a cada REFRESH_MINUTES (só com a aba visível)
function useCanvas() {
  const [state, setState] = useState({ status: "loading", data: null, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const load = () => {
      if (document.visibilityState === "hidden") return;
      setState((old) => ({ ...old, status: "loading" }));
      fetchCanvas()
        .then((data) => active && setState({ status: "ready", data, error: null }))
        .catch((error) => active && setState((old) => ({ status: "error", data: old.data, error })));
    };
    load();
    const id = setInterval(load, CANVAS_CONFIG.REFRESH_MINUTES * 60_000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [attempt]);

  return { ...state, reload: () => setAttempt((n) => n + 1) };
}

/* =====================================================================
   Pedaços da tela
   ===================================================================== */

function ErrorBox({ error, onRetry }) {
  const hint = {
    missing_config: "Crie o .env.local com o CANVAS_TOKEN e reinicie o npm run dev.",
    invalid_token: "Gere um token novo no Canvas: Conta → Configurações → + Novo token de acesso.",
    network: "Confira o CANVAS_URL no .env.local (ex.: https://pucminas.instructure.com).",
  }[error?.code];

  return (
    <div className={`cnv-message ${error?.code === "missing_config" ? "warning" : "error"}`} role="alert">
      <strong>{error?.message ?? "Não foi possível carregar o Canvas."}</strong>
      {hint && <span>{hint}</span>}
      <button type="button" className="cnv-retry" onClick={onRetry}>
        <FiRefreshCw aria-hidden="true" /> Tentar de novo
      </button>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="cnv-skeleton" aria-hidden="true">
      <div className="cnv-skeleton-kpis">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} />
        ))}
      </div>
      <span style={{ height: 150 }} />
      <span style={{ height: 360 }} />
    </div>
  );
}

function Kpis({ items }) {
  return (
    <ul className="cnv-kpis">
      {items.map(({ icon: Icon, label, value, note, tone }) => (
        <li key={label} className={`cnv-kpi ${tone ?? ""}`}>
          <span className="cnv-kpi-label">
            <Icon aria-hidden="true" />
            {label}
          </span>
          <span className="cnv-kpi-value">{value}</span>
          {note && <span className="cnv-kpi-note">{note}</span>}
        </li>
      ))}
    </ul>
  );
}

// Próxima entrega em destaque, com contagem regressiva que anda sozinha
function NextDue({ assignment, course }) {
  const now = useNow(1000);
  if (!assignment) return null;
  const due = toMs(assignment.dueAt);

  return (
    <section className="cnv-next">
      <div className="cnv-next-info">
        <span className="cnv-next-title">Próxima entrega</span>
        <a className="cnv-next-name" href={assignment.url} target="_blank" rel="noopener noreferrer">
          {assignment.name}
        </a>
        <span className="cnv-next-meta">
          <CourseTag course={course} />
          <span>
            {formatLongDate(due)} · {formatTime(due)}
          </span>
          {assignment.points > 0 && <span>{formatNumber(assignment.points)} pts</span>}
        </span>
      </div>
      <Countdown ms={due - now} />
    </section>
  );
}

/* =====================================================================
   Componente principal
   ===================================================================== */

export default function CanvasDashboard({ initialSection = CANVAS_CONFIG.DEFAULT_SECTION }) {
  const { status, data, error, reload } = useCanvas();
  const [section, setSection] = useState(initialSection);
  const [courseFilter, setCourseFilter] = useState("all");
  const now = useNow(30_000);

  const courses = useMemo(() => decorateCourses(data?.courses ?? []), [data]);
  const coursesById = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses]);

  const visibleCourses = courseFilter === "all" ? courses : courses.filter((c) => c.id === courseFilter);
  const assignments = (data?.assignments ?? []).filter(
    (a) => courseFilter === "all" || a.courseId === courseFilter
  );
  const events = (data?.events ?? []).filter((e) => courseFilter === "all" || e.courseId === courseFilter);

  const { upcoming } = splitAssignments(assignments, now);
  const thisWeek = upcoming.filter((a) => toMs(a.dueAt) - now <= CANVAS_CONFIG.WEEK_DAYS * DAY);
  const teaches = visibleCourses.some((c) => c.role === "teacher");
  const toGrade = assignments.reduce((n, a) => n + (a.needsGrading ?? 0), 0);
  const late = assignments.filter((a) => studentStatus(a, now)?.key === "missing").length;
  const students = visibleCourses.reduce((n, c) => n + (c.students ?? 0), 0);
  const nextEvents = events.filter((e) => toMs(e.start) >= now && toMs(e.start) - now <= 30 * DAY);

  return (
    <div className="cnv" aria-busy={status === "loading"}>
      {status === "error" && <ErrorBox error={error} onRetry={reload} />}
      {status === "loading" && !data && <Skeleton />}

      {data && (
        <>
          {/* ---------- Quem está logado ---------- */}
          <header className="cnv-user">
            {data.user.avatar ? (
              <img className="cnv-avatar" src={data.user.avatar} alt="" />
            ) : (
              <span className="cnv-avatar cnv-avatar-initials" aria-hidden="true">
                {data.user.name
                  ?.split(/\s+/)
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")}
              </span>
            )}
            <div className="cnv-user-info">
              <h2>{data.user.name}</h2>
              <p>
                {courses.length} {courses.length === 1 ? "curso ativo" : "cursos ativos"} ·{" "}
                {new URL(data.canvasUrl).host}
              </p>
            </div>
            <OpenInCanvas href={data.canvasUrl}>Abrir o Canvas</OpenInCanvas>
          </header>

          {/* ---------- Indicadores ---------- */}
          <Kpis
            items={[
              {
                icon: FiBookOpen,
                label: "Cursos",
                value: formatNumber(visibleCourses.length),
                note: students ? `${formatNumber(students)} alunos` : null,
              },
              {
                icon: FiCalendar,
                label: "Esta semana",
                value: formatNumber(thisWeek.length),
                note: `${thisWeek.length === 1 ? "entrega" : "entregas"} em ${CANVAS_CONFIG.WEEK_DAYS} dias`,
              },
              teaches
                ? {
                    icon: FiEdit3,
                    label: "A corrigir",
                    value: formatNumber(toGrade),
                    note: "entregas esperando nota",
                    tone: toGrade ? "warn" : "",
                  }
                : {
                    icon: FiAlertCircle,
                    label: "Atrasadas",
                    value: formatNumber(late),
                    note: "tarefas sem entrega",
                    tone: late ? "danger" : "",
                  },
              {
                icon: FiFlag,
                label: "Eventos",
                value: formatNumber(nextEvents.length),
                note: "no calendário (30 dias)",
              },
            ]}
          />

          <NextDue assignment={upcoming[0]} course={coursesById.get(upcoming[0]?.courseId)} />

          {/* ---------- Seção + filtro de curso ---------- */}
          <div className="cnv-toolbar">
            <div className="cnv-tabs" role="tablist" aria-label="Seção">
              {SECTIONS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={section === key}
                  className={section === key ? "active" : ""}
                  onClick={() => setSection(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {courses.length > 1 && (
              <div className="cnv-filters" role="group" aria-label="Curso">
                <button
                  type="button"
                  className={courseFilter === "all" ? "active" : ""}
                  aria-pressed={courseFilter === "all"}
                  onClick={() => setCourseFilter("all")}
                >
                  Todos
                </button>
                {courses.map((course) => (
                  <button
                    key={course.id}
                    type="button"
                    className={courseFilter === course.id ? "active" : ""}
                    aria-pressed={courseFilter === course.id}
                    style={{ "--course": course.color }}
                    title={course.name}
                    onClick={() => setCourseFilter(course.id)}
                  >
                    <span className="cnv-tag-dot" aria-hidden="true" />
                    {course.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className={status === "loading" ? "cnv-body updating" : "cnv-body"}>
            {section === "resumo" && (
              <SummarySection
                courses={visibleCourses}
                assignments={assignments}
                coursesById={coursesById}
                now={now}
              />
            )}
            {section === "tarefas" && (
              <TasksSection assignments={assignments} coursesById={coursesById} now={now} />
            )}
            {section === "agenda" && (
              <AgendaSection
                assignments={assignments}
                events={events}
                coursesById={coursesById}
                now={now}
              />
            )}
          </div>

          <p className="cnv-source">
            Dados do Canvas LMS · atualizado às {formatTime(toMs(data.generatedAt))}
            {teaches && " · só contagens de entregas, nunca nomes ou notas de alunos"}
          </p>
        </>
      )}
    </div>
  );
}
