// Busca cursos, tarefas, entregas e eventos do Canvas no SERVIDOR, para o
// token não ir para o navegador.
//
// Quem chama esta função:
//   • em produção, a Vercel Function api/canvas.js  → GET /api/canvas
//   • no npm run dev / npm run preview, o vite.config.js (mesma rota)
//
// Variáveis de ambiente (sem o prefixo VITE_, de propósito: variáveis com
// VITE_ vão para o build e qualquer visitante consegue ler):
//   CANVAS_TOKEN    → token de acesso (Conta → Configurações → "+ Novo token de acesso")
//   CANVAS_URL      → opcional: endereço do Canvas (padrão: https://pucminas.instructure.com)
//   CANVAS_COURSES  → opcional: ids dos cursos, separados por vírgula (vazio = todos os ativos)
//
// Privacidade: a resposta leva só cursos, tarefas, prazos, eventos e
// CONTAGENS de entregas. Nomes, e-mails e notas de alunos nunca saem daqui.
//
// O nome do arquivo começa com "_" para a Vercel NÃO transformá-lo em rota.

export const CANVAS_PATH = "/api/canvas";

const DEFAULT_URL = "https://pucminas.instructure.com";
const TIMEOUT_MS = 15_000;
const PER_PAGE = 100;
const MAX_PAGES = 20; // até 2.000 itens por consulta
const CONCURRENCY = 4; // chamadas ao Canvas ao mesmo tempo
const MAX_COURSES = 20;

// Janela das tarefas e eventos (em dias, a partir de hoje)
const DAYS_PAST = 21;
const DAYS_AHEAD = 45;
// Professor: quantas tarefas ganham o resumo de entregas (uma chamada cada)
const SUMMARY_MAX = 25;

const DAY_MS = 86_400_000;

/* =====================================================================
   Resposta HTTP (funciona igual na Vercel e no servidor do Vite)
   ===================================================================== */

// Uma resposta por minuto no máximo, não importa quantas pessoas abram a página
const CACHE_OK = "public, max-age=0, s-maxage=60, stale-while-revalidate=300";

function send(res, status, body, cache = "no-store") {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", cache);
  res.end(JSON.stringify(body));
}

class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

/* =====================================================================
   Chamadas ao Canvas (com paginação pelo cabeçalho Link)
   ===================================================================== */

function canvasClient(base, token) {
  const origin = new URL(base).origin;
  const headers = {
    // Ids como texto: os do Canvas podem passar do maior inteiro seguro do JS
    Accept: "application/json+canvas-string-ids",
    Authorization: `Bearer ${token}`,
  };

  const buildUrl = (path, params = {}) => {
    const url = new URL(path, origin);
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value)) value.forEach((v) => url.searchParams.append(key, v));
      else url.searchParams.set(key, value);
    }
    return url.href;
  };

  async function request(url) {
    let response;
    try {
      response = await fetch(url, { headers, signal: AbortSignal.timeout(TIMEOUT_MS) });
    } catch (error) {
      if (error.name === "TimeoutError") throw new HttpError(504, "timeout", "O Canvas demorou demais para responder.");
      throw new HttpError(502, "network", `Sem resposta de ${origin}. Confira o CANVAS_URL.`);
    }
    if (response.ok) return response;

    if (response.status === 401) {
      throw new HttpError(401, "invalid_token", "O Canvas recusou o token (401). Ele pode ter expirado ou sido apagado.");
    }
    if (response.status === 403) {
      const text = await response.text();
      if (/rate limit/i.test(text)) throw new HttpError(429, "rate_limit", "Limite de chamadas do Canvas. Tente de novo em instantes.");
      throw new HttpError(403, "forbidden", "O token não tem acesso a este recurso (403).");
    }
    if (response.status === 404) throw new HttpError(404, "not_found", "Recurso não encontrado no Canvas (404).");
    throw new HttpError(502, "canvas_error", `O Canvas respondeu ${response.status}.`);
  }

  // A próxima página vem no cabeçalho Link. O token só segue se ela for do mesmo Canvas.
  function nextPage(link) {
    const next = link?.match(/<([^>]+)>;\s*rel="next"/)?.[1];
    if (!next) return null;
    return new URL(next, origin).origin === origin ? next : null;
  }

  return {
    origin,
    async one(path, params) {
      return (await request(buildUrl(path, params))).json();
    },
    async all(path, params = {}) {
      const items = [];
      let url = buildUrl(path, { per_page: PER_PAGE, ...params });
      for (let i = 0; url && i < MAX_PAGES; i++) {
        const response = await request(url);
        const page = await response.json();
        if (!Array.isArray(page)) break;
        items.push(...page);
        url = nextPage(response.headers.get("link"));
      }
      return items;
    },
  };
}

// Roda fn em cada item, no máximo `limit` ao mesmo tempo
async function inParallel(items, limit, fn) {
  const results = Array.from({ length: items.length });
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

/* =====================================================================
   Normalização: devolve só o que a tela usa
   ===================================================================== */

const TEACHER_ROLES = ["teacher", "ta", "designer"];

function normalizeCourse(course) {
  const roles = (course.enrollments ?? []).map((e) => e.type ?? e.role);
  return {
    id: String(course.id),
    name: course.name,
    code: course.course_code ?? null,
    url: null, // preenchido depois (precisa do endereço do Canvas)
    term: course.term?.name ?? null,
    // Professor (ou monitor) vê "a corrigir"; aluno vê "entregue / pendente"
    role: roles.some((r) => TEACHER_ROLES.some((t) => r?.toLowerCase().includes(t))) ? "teacher" : "student",
    students: course.total_students ?? null,
    endAt: course.end_at ?? course.term?.end_at ?? null,
  };
}

function normalizeSubmission(submission) {
  if (!submission) return null;
  return {
    state: submission.workflow_state ?? null, // unsubmitted | submitted | graded | pending_review
    submitted: Boolean(submission.submitted_at),
    submittedAt: submission.submitted_at ?? null,
    late: Boolean(submission.late),
    missing: Boolean(submission.missing),
    excused: Boolean(submission.excused),
    score: submission.score ?? null,
  };
}

function normalizeAssignment(assignment, course) {
  return {
    id: String(assignment.id),
    courseId: course.id,
    name: assignment.name,
    url: assignment.html_url,
    dueAt: assignment.due_at,
    unlockAt: assignment.unlock_at,
    lockAt: assignment.lock_at,
    points: assignment.points_possible ?? null,
    types: assignment.submission_types ?? [],
    group: Boolean(assignment.group_category_id),
    // Professor: quantas entregas esperam correção (o Canvas só manda para quem corrige)
    needsGrading: course.role === "teacher" ? (assignment.needs_grading_count ?? 0) : null,
    // Aluno: a sua entrega
    submission: course.role === "student" ? normalizeSubmission(assignment.submission) : null,
    summary: null, // professor: preenchido em addSummaries()
  };
}

function normalizeEvent(event) {
  return {
    id: String(event.id),
    courseId: event.context_code?.replace(/^course_/, "") ?? null,
    title: event.title,
    start: event.start_at,
    end: event.end_at,
    allDay: Boolean(event.all_day),
    location: event.location_name || null,
    url: event.html_url ?? null,
  };
}

/* =====================================================================
   Montagem do painel
   ===================================================================== */

const inWindow = (iso, now) => {
  if (!iso) return false;
  const ms = Date.parse(iso);
  return ms >= now - DAYS_PAST * DAY_MS && ms <= now + DAYS_AHEAD * DAY_MS;
};

async function loadCourses(canvas, onlyIds, now) {
  const raw = await canvas.all("/api/v1/courses", {
    enrollment_state: "active",
    "state[]": ["available"],
    "include[]": ["term", "total_students"],
  });

  return raw
    .map(normalizeCourse)
    .filter((course) => {
      if (onlyIds.length) return onlyIds.includes(course.id);
      // Matrícula "ativa" em curso de semestre que já acabou: fica de fora
      return !course.endAt || Date.parse(course.endAt) > now - DAYS_PAST * DAY_MS;
    })
    .slice(0, MAX_COURSES)
    .map((course) => ({ ...course, url: `${canvas.origin}/courses/${course.id}` }));
}

async function loadAssignments(canvas, courses) {
  const lists = await inParallel(courses, CONCURRENCY, async (course) => {
    const raw = await canvas.all(`/api/v1/courses/${course.id}/assignments`, {
      order_by: "due_at",
      "include[]": course.role === "student" ? ["submission"] : [],
    });
    return raw.filter((a) => a.published !== false).map((a) => normalizeAssignment(a, course));
  });
  return lists.flat();
}

// Professor: entregues, corrigidas e faltando de cada tarefa perto de hoje
async function addSummaries(canvas, assignments, coursesById, now) {
  const targets = assignments
    .filter((a) => coursesById.get(a.courseId)?.role === "teacher" && inWindow(a.dueAt, now))
    .sort((a, b) => Math.abs(Date.parse(a.dueAt) - now) - Math.abs(Date.parse(b.dueAt) - now))
    .slice(0, SUMMARY_MAX);

  await inParallel(targets, CONCURRENCY, async (assignment) => {
    try {
      const s = await canvas.one(
        `/api/v1/courses/${assignment.courseId}/assignments/${assignment.id}/submission_summary`
      );
      assignment.summary = {
        graded: s.graded ?? 0,
        ungraded: s.ungraded ?? 0,
        notSubmitted: s.not_submitted ?? 0,
      };
    } catch {
      // Sem resumo: a tarefa aparece do mesmo jeito
    }
  });
}

async function loadEvents(canvas, courses, now) {
  const codes = courses.map((c) => `course_${c.id}`);
  const batches = [];
  for (let i = 0; i < codes.length; i += 10) batches.push(codes.slice(i, i + 10)); // limite do Canvas

  const lists = await inParallel(batches, CONCURRENCY, (batch) =>
    canvas.all("/api/v1/calendar_events", {
      type: "event",
      "context_codes[]": batch,
      start_date: new Date(now - DAY_MS).toISOString(),
      end_date: new Date(now + DAYS_AHEAD * DAY_MS).toISOString(),
    })
  );

  return lists
    .flat()
    .filter((event) => !event.appointment_group_id) // horários reservados por alunos: fora
    .map(normalizeEvent)
    .sort((a, b) => Date.parse(a.start) - Date.parse(b.start));
}

async function buildDashboard(env) {
  const token = env.CANVAS_TOKEN?.trim();
  const base = (env.CANVAS_URL?.trim() || DEFAULT_URL).replace(/\/+$/, "");
  const onlyIds = (env.CANVAS_COURSES ?? "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);
  const canvas = canvasClient(/^https?:\/\//.test(base) ? base : `https://${base}`, token);
  const now = Date.now();

  const [user, courses] = await Promise.all([
    canvas.one("/api/v1/users/self"),
    loadCourses(canvas, onlyIds, now),
  ]);
  const coursesById = new Map(courses.map((c) => [c.id, c]));

  const [assignments, events] = await Promise.all([
    loadAssignments(canvas, courses),
    loadEvents(canvas, courses, now).catch(() => []), // sem calendário, o resto aparece
  ]);
  await addSummaries(canvas, assignments, coursesById, now);

  return {
    canvasUrl: canvas.origin,
    generatedAt: new Date(now).toISOString(),
    user: {
      name: user.short_name ?? user.name,
      avatar: user.avatar_url && !/avatar-50\.png/.test(user.avatar_url) ? user.avatar_url : null,
    },
    // endAt só serviu para o filtro acima: não vai para o navegador
    courses: courses.map(({ endAt: _endAt, ...course }) => course),
    assignments,
    events,
  };
}

/* =====================================================================
   Cache em memória (a função da Vercel fica "quente" por alguns minutos)
   ===================================================================== */

const MEMORY_MS = 60_000;
let memory = null;

export async function handleCanvas(req, res, env = {}) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return send(res, 405, { error: "method_not_allowed", message: "Use GET." });
  }

  if (!env.CANVAS_TOKEN?.trim()) {
    return send(res, 503, {
      error: "missing_config",
      message: "Configure CANVAS_TOKEN no .env.local (npm run dev) ou nas Environment Variables da Vercel.",
    });
  }

  try {
    if (!memory || Date.now() - memory.at > MEMORY_MS) {
      memory = { at: Date.now(), body: await buildDashboard(env) };
    }
    return send(res, 200, memory.body, CACHE_OK);
  } catch (error) {
    memory = null;
    if (error instanceof HttpError) {
      return send(res, error.status, { error: error.code, message: error.message });
    }
    console.error("[canvas]", error);
    return send(res, 500, { error: "server_error", message: "Erro inesperado ao montar o painel." });
  }
}
