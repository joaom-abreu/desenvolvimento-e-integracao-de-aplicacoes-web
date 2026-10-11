import { FiAlertCircle, FiBookOpen, FiCalendar, FiCheckSquare, FiClock, FiInbox } from "react-icons/fi";
import CANVAS_CONFIG from "../../config/canvasConfig";
import {
  DAY,
  dayKey,
  formatDay,
  formatDayMonth,
  formatLongDate,
  formatPercent,
  formatTime,
  splitAssignments,
  studentStatus,
  teacherSummary,
  toMs,
} from "./canvasUtils";
import { AssignmentList, AssignmentRow, CourseTag, EventRow } from "./Parts";

/* =====================================================================
   RESUMO: próximos dias + uma linha por curso
   ===================================================================== */

function CourseTable({ courses, assignments, now }) {
  const rows = courses.map((course) => {
    const mine = assignments.filter((a) => a.courseId === course.id);
    const { upcoming } = splitAssignments(mine, now);
    const next = upcoming[0] ?? null;

    if (course.role === "teacher") {
      const summaries = mine.map(teacherSummary).filter(Boolean);
      const total = summaries.reduce((n, s) => n + s.total, 0);
      const submitted = summaries.reduce((n, s) => n + s.submitted, 0);
      return {
        course,
        count: mine.length,
        next,
        progress: total ? formatPercent(submitted / total) : "—",
        progressNote: "das entregas recentes",
        pending: mine.reduce((n, a) => n + (a.needsGrading ?? 0), 0),
        pendingLabel: "a corrigir",
      };
    }

    const statuses = mine.map((a) => studentStatus(a, now)).filter(Boolean);
    const done = statuses.filter((s) => ["done", "late", "graded", "excused"].includes(s.key)).length;
    return {
      course,
      count: mine.length,
      next,
      progress: statuses.length ? formatPercent(done / statuses.length) : "—",
      progressNote: "das tarefas entregues",
      pending: statuses.filter((s) => s.key === "missing").length,
      pendingLabel: "atrasadas",
    };
  });

  return (
    <div className="cnv-table-wrap">
      <table className="cnv-table">
        <thead>
          <tr>
            <th scope="col">Curso</th>
            <th scope="col" className="num">Tarefas</th>
            <th scope="col">Próxima entrega</th>
            <th scope="col" className="num">Entregas</th>
            <th scope="col" className="num">Pendências</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.course.id}>
              <td>
                <div className="cnv-course-cell">
                  <CourseTag course={row.course} />
                  <a href={row.course.url} target="_blank" rel="noopener noreferrer" title={row.course.name}>
                    {row.course.title}
                  </a>
                  <small>
                    {[row.course.term, row.course.students ? `${row.course.students} alunos` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </small>
                </div>
              </td>
              <td className="num">{row.count}</td>
              <td>
                {row.next ? (
                  <div className="cnv-next-cell">
                    <strong>
                      {formatDay(toMs(row.next.dueAt), now)} · {formatTime(toMs(row.next.dueAt))}
                    </strong>
                    <span title={row.next.name}>{row.next.name}</span>
                  </div>
                ) : (
                  <span className="cnv-muted">nada marcado</span>
                )}
              </td>
              <td className="num" title={row.progressNote}>
                {row.progress}
              </td>
              <td className="num">
                {row.pending > 0 ? (
                  <span className={`cnv-pill ${row.pendingLabel === "atrasadas" ? "danger" : "warn"}`}>
                    {row.pending} {row.pendingLabel}
                  </span>
                ) : (
                  <span className="cnv-muted">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SummarySection({ courses, assignments, coursesById, now }) {
  const { upcoming } = splitAssignments(assignments, now);
  const week = upcoming.filter((a) => toMs(a.dueAt) - now <= CANVAS_CONFIG.WEEK_DAYS * DAY);

  return (
    <div className="cnv-stack">
      <section className="cnv-card">
        <h3>
          <FiClock aria-hidden="true" /> Próximos {CANVAS_CONFIG.WEEK_DAYS} dias
        </h3>
        <AssignmentList
          assignments={week}
          coursesById={coursesById}
          now={now}
          empty={`Nenhuma entrega nos próximos ${CANVAS_CONFIG.WEEK_DAYS} dias.`}
        />
      </section>

      <section className="cnv-card">
        <h3>
          <FiBookOpen aria-hidden="true" /> Cursos
        </h3>
        <CourseTable courses={courses} assignments={assignments} now={now} />
      </section>
    </div>
  );
}

/* =====================================================================
   TAREFAS: pela frente, vencidas e sem prazo
   ===================================================================== */

export function TasksSection({ assignments, coursesById, now }) {
  const { upcoming, overdue, noDate } = splitAssignments(assignments, now);
  const groups = [
    { key: "upcoming", icon: FiCalendar, title: "Pela frente", items: upcoming, empty: "Nenhuma tarefa com prazo pela frente." },
    {
      key: "overdue",
      icon: FiAlertCircle,
      title: `Vencidas (últimos ${CANVAS_CONFIG.OVERDUE_DAYS} dias)`,
      items: overdue,
      empty: "Nenhuma tarefa vencida recentemente.",
    },
    { key: "noDate", icon: FiInbox, title: "Sem prazo", items: noDate, empty: "Todas as tarefas têm prazo." },
  ];

  return (
    <div className="cnv-stack">
      {groups.map(({ key, icon: Icon, title, items, empty }) =>
        key === "noDate" && !items.length ? null : (
          <section key={key} className="cnv-card">
            <h3>
              <Icon aria-hidden="true" /> {title}
              <span className="cnv-count">{items.length}</span>
            </h3>
            <AssignmentList
              assignments={items}
              coursesById={coursesById}
              now={now}
              empty={empty}
              showCountdown={key !== "noDate"}
            />
          </section>
        )
      )}
    </div>
  );
}

/* =====================================================================
   AGENDA: tarefas + eventos do calendário, dia a dia
   ===================================================================== */

export function AgendaSection({ assignments, events, coursesById, now }) {
  const limit = now + CANVAS_CONFIG.AGENDA_DAYS * DAY;
  const items = [
    ...assignments
      .filter((a) => {
        const due = toMs(a.dueAt);
        return due !== null && due >= now - DAY && due <= limit;
      })
      .map((a) => ({ kind: "assignment", at: toMs(a.dueAt), item: a })),
    ...events
      .filter((e) => {
        const start = toMs(e.start);
        return start !== null && start >= now - DAY && start <= limit;
      })
      .map((e) => ({ kind: "event", at: toMs(e.start), item: e })),
  ].sort((a, b) => a.at - b.at);

  const days = new Map();
  for (const entry of items) {
    const key = dayKey(entry.at);
    if (!days.has(key)) days.set(key, { at: entry.at, entries: [] });
    days.get(key).entries.push(entry);
  }

  if (!days.size) {
    return (
      <section className="cnv-card">
        <p className="cnv-empty">Nada na agenda nos próximos {CANVAS_CONFIG.AGENDA_DAYS} dias.</p>
      </section>
    );
  }

  return (
    <section className="cnv-card">
      <h3>
        <FiCheckSquare aria-hidden="true" /> Agenda dos próximos {CANVAS_CONFIG.AGENDA_DAYS} dias
      </h3>
      <ol className="cnv-agenda">
        {[...days.values()].map(({ at, entries }) => {
          const label = formatDay(at, now);
          const isNamed = ["hoje", "amanhã", "ontem"].includes(label);
          return (
            <li key={dayKey(at)} className="cnv-agenda-day">
              <h4>
                <span className="cnv-agenda-label">{isNamed ? label : formatLongDate(at)}</span>
                {isNamed && <span className="cnv-muted">{formatDayMonth(at)}</span>}
              </h4>
              <ul className="cnv-list">
                {entries.map(({ kind, item }) =>
                  kind === "event" ? (
                    <EventRow key={`e${item.id}`} event={item} course={coursesById.get(item.courseId)} />
                  ) : (
                    <AssignmentRow
                      key={`a${item.id}`}
                      assignment={item}
                      course={coursesById.get(item.courseId)}
                      now={now}
                      timeOnly
                    />
                  )
                )}
              </ul>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

