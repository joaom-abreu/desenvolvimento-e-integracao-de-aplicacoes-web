import { useEffect, useState } from "react";
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiEdit3,
  FiExternalLink,
  FiFileText,
  FiMapPin,
  FiUsers,
} from "react-icons/fi";
import {
  formatCountdown,
  formatDay,
  formatDayNumber,
  formatMonth,
  formatNumber,
  formatTime,
  formatWeekday,
  isOnline,
  studentStatus,
  teacherSummary,
  timeParts,
  toMs,
} from "./canvasUtils";

/* Pedaços usados pelas seções do painel */

// Hora de agora, renovada a cada `interval` ms (contagens regressivas)
export function useNow(interval = 30_000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return now;
}

// Etiqueta colorida do curso: "DIAW · Manhã"
export function CourseTag({ course }) {
  if (!course) return null;
  return (
    <span className="cnv-tag" style={{ "--course": course.color }} title={course.name}>
      <span className="cnv-tag-dot" aria-hidden="true" />
      {course.label}
    </span>
  );
}

// Folhinha do calendário: "14 OUT qua"
export function DateChip({ ms, muted = false }) {
  if (!ms) {
    return (
      <span className="cnv-date cnv-date-none" aria-label="Sem prazo">
        <b>—</b>
        <span>sem prazo</span>
      </span>
    );
  }
  return (
    <span className={`cnv-date ${muted ? "muted" : ""}`}>
      <small>{formatMonth(ms)}</small>
      <b>{formatDayNumber(ms)}</b>
      <span>{formatWeekday(ms)}</span>
    </span>
  );
}

// Professor: barra entregues / corrigidas / faltando
function SubmissionBar({ summary }) {
  const { graded, ungraded, notSubmitted, total, submitted } = summary;
  if (!total) return null;
  const pct = (n) => `${(n / total) * 100}%`;
  return (
    <span className="cnv-subs" title={`${graded} corrigidas · ${ungraded} a corrigir · ${notSubmitted} sem entrega`}>
      <span className="cnv-subs-bar" aria-hidden="true">
        <span className="graded" style={{ width: pct(graded) }} />
        <span className="ungraded" style={{ width: pct(ungraded) }} />
      </span>
      <span className="cnv-subs-text">
        {submitted}/{total} entregaram
      </span>
    </span>
  );
}

// Situação da tarefa: professor (a corrigir, entregas) ou aluno (entregue, pendente...)
export function AssignmentStatus({ assignment, now }) {
  const summary = teacherSummary(assignment);
  if (assignment.needsGrading !== null) {
    return (
      <span className="cnv-status-group">
        {summary && <SubmissionBar summary={summary} />}
        {assignment.needsGrading > 0 && (
          <span className="cnv-badge warn">
            <FiEdit3 aria-hidden="true" />
            {assignment.needsGrading} a corrigir
          </span>
        )}
        {!isOnline(assignment) && <span className="cnv-badge">sem entrega online</span>}
      </span>
    );
  }

  const status = studentStatus(assignment, now);
  if (!status) return null;
  const icon = { done: FiCheckCircle, graded: FiCheckCircle, missing: FiAlertTriangle }[status.key];
  const Icon = icon ?? FiClock;
  return (
    <span className={`cnv-badge status-${status.key}`}>
      <Icon aria-hidden="true" />
      {status.label}
    </span>
  );
}

// Uma tarefa da lista
export function AssignmentRow({ assignment, course, now, showCountdown = true, timeOnly = false }) {
  const due = toMs(assignment.dueAt);
  const past = due !== null && due < now;
  return (
    <li className={`cnv-item ${past ? "is-past" : ""}`}>
      {timeOnly ? (
        <span className="cnv-event-time">{formatTime(due)}</span>
      ) : (
        <DateChip ms={due} muted={past} />
      )}
      <div className="cnv-item-body">
        <a className="cnv-item-title" href={assignment.url} target="_blank" rel="noopener noreferrer">
          <FiFileText aria-hidden="true" />
          {assignment.name}
        </a>
        <div className="cnv-item-meta">
          <CourseTag course={course} />
          {due && !timeOnly && (
            <span className="cnv-when">
              <FiClock aria-hidden="true" />
              {formatDay(due, now)} · {formatTime(due)}
            </span>
          )}
          {assignment.points !== null && assignment.points > 0 && (
            <span>{formatNumber(assignment.points)} pts</span>
          )}
          {assignment.group && (
            <span>
              <FiUsers aria-hidden="true" /> em grupo
            </span>
          )}
        </div>
      </div>
      <div className="cnv-item-side">
        {showCountdown && due && (
          <span className={`cnv-countdown-text ${past ? "past" : due - now < 2 * 86_400_000 ? "soon" : ""}`}>
            {formatCountdown(due, now)}
          </span>
        )}
        <AssignmentStatus assignment={assignment} now={now} />
      </div>
    </li>
  );
}

export function AssignmentList({ assignments, coursesById, now, empty, showCountdown }) {
  if (!assignments.length) return <p className="cnv-empty">{empty}</p>;
  return (
    <ul className="cnv-list">
      {assignments.map((a) => (
        <AssignmentRow
          key={a.id}
          assignment={a}
          course={coursesById.get(a.courseId)}
          now={now}
          showCountdown={showCountdown}
        />
      ))}
    </ul>
  );
}

// Evento do calendário (prova, aula, apresentação...)
export function EventRow({ event, course }) {
  const start = toMs(event.start);
  const end = toMs(event.end);
  return (
    <li className="cnv-item cnv-event">
      <span className="cnv-event-time">
        {event.allDay ? "dia todo" : `${formatTime(start)}${end && end !== start ? `–${formatTime(end)}` : ""}`}
      </span>
      <div className="cnv-item-body">
        <a className="cnv-item-title" href={event.url ?? undefined} target="_blank" rel="noopener noreferrer">
          {event.title}
        </a>
        <div className="cnv-item-meta">
          <CourseTag course={course} />
          {event.location && (
            <span>
              <FiMapPin aria-hidden="true" />
              {event.location}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

// Contagem regressiva grande (próxima entrega)
export function Countdown({ ms }) {
  const { days, hours, minutes, seconds } = timeParts(Math.max(0, ms));
  const parts = [
    [days, days === 1 ? "dia" : "dias"],
    [hours, "horas"],
    [minutes, "min"],
    [seconds, "seg"],
  ];
  return (
    <ol className="cnv-countdown" aria-label="Contagem regressiva">
      {parts.map(([value, label]) => (
        <li key={label}>
          <b>{String(value).padStart(2, "0")}</b>
          <span>{label}</span>
        </li>
      ))}
    </ol>
  );
}

export function OpenInCanvas({ href, children = "Abrir no Canvas" }) {
  return (
    <a className="cnv-link" href={href} target="_blank" rel="noopener noreferrer">
      {children} <FiExternalLink aria-hidden="true" />
    </a>
  );
}
