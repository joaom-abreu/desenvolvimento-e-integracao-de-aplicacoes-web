// Ajusta as legendas que o Gemini devolveu ao padrão de legendagem:
//
//   1. junta os trechos (tempos absolutos) e remove repetições na emenda;
//   2. divide legendas com texto demais (mais de 2 linhas) em duas ou mais;
//   3. garante duração mínima e máxima e um intervalo entre legendas;
//   4. quebra o texto em até 2 linhas equilibradas (ex.: 42 caracteres cada).
//
// Funções puras (sem React): dá para testar e reaproveitar.

const SENTENCE_END = /[.!?…]["”']?$/;
const CLAUSE_END = /[,;:]$/;

const clean = (text) => String(text ?? "").replace(/\s+/g, " ").trim();

/**
 * Melhor ponto para dividir `text` em duas partes, perto de `target`
 * (índice de um espaço). Prefere fim de frase, depois vírgula, depois qualquer espaço.
 */
function bestSplit(text, target, { minLeft = 1, minRight = 1 } = {}) {
  let best = -1;
  let bestScore = Infinity;
  for (let i = 0; i < text.length; i += 1) {
    if (text[i] !== " ") continue;
    if (i < minLeft || text.length - i - 1 < minRight) continue;
    const left = text.slice(0, i);
    // Não deixa "a", "de", "o"... sozinho no fim da primeira parte
    const lastWord = left.slice(left.lastIndexOf(" ") + 1);
    let score = Math.abs(i - target);
    if (SENTENCE_END.test(left)) score -= text.length * 0.35;
    else if (CLAUSE_END.test(left)) score -= text.length * 0.2;
    else if (lastWord.length <= 2) score += 6;
    if (score < bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return best;
}

/** Divide uma legenda longa em partes de até `maxChars`, com tempo proporcional ao texto. */
export function splitLongCue(cue, maxChars) {
  const text = clean(cue.text);
  if (text.length <= maxChars) return [{ ...cue, text }];

  const cut = bestSplit(text, text.length / 2, { minLeft: 8, minRight: 8 });
  if (cut < 0) return [{ ...cue, text }]; // uma "palavra" enorme: deixa como está

  const left = text.slice(0, cut);
  const right = text.slice(cut + 1);
  const middle = cue.start + (cue.end - cue.start) * (left.length / text.length);
  return [
    ...splitLongCue({ ...cue, end: middle, text: left }, maxChars),
    ...splitLongCue({ ...cue, start: middle, text: right }, maxChars),
  ];
}

/**
 * Quebra o texto em até 2 linhas equilibradas de no máximo `maxLine` caracteres.
 * Diálogo ("- Oi. - Tudo bem?") vira uma fala por linha.
 */
export function wrapText(text, maxLine = 42) {
  const value = clean(text);

  const dialogue = value.match(/^-\s*(.+?)\s+-\s+(.+)$/);
  if (dialogue) return `- ${dialogue[1]}\n- ${dialogue[2]}`;

  if (value.length <= maxLine) return value;

  // Linhas parecidas (formato de pirâmide) e nenhuma passando do limite
  const cut = bestSplit(value, value.length / 2, {
    minLeft: Math.max(1, value.length - maxLine - 1),
    minRight: Math.max(1, value.length - maxLine - 1),
  });
  if (cut < 0) return value;
  return `${value.slice(0, cut)}\n${value.slice(cut + 1)}`;
}

/** Chave para comparar textos ignorando pontuação e maiúsculas */
const sameText = (a, b) => {
  const key = (t) => clean(t).toLowerCase().replace(/[^\p{L}\p{N} ]/gu, "");
  return key(a) === key(b);
};

/**
 * segments: [{ start, end, text }] com tempos ABSOLUTOS (já somado o início do trecho)
 * Devolve: [{ id, start, end, text }] prontas para o SRT.
 */
export function normalizeCues(
  segments,
  { maxLine = 42, maxLines = 2, minDuration = 1, maxDuration = 7, minGap = 0.08, duration = Infinity } = {}
) {
  // 1. Ordena, limpa e tira repetições (a mesma fala nas duas pontas de uma emenda)
  const sorted = segments
    .map((s) => ({ start: Number(s.start), end: Number(s.end), text: clean(s.text) }))
    .filter((s) => s.text && Number.isFinite(s.start) && Number.isFinite(s.end))
    .sort((a, b) => a.start - b.start);

  const unique = [];
  for (const seg of sorted) {
    const previous = unique.at(-1);
    if (previous && sameText(previous.text, seg.text) && seg.start - previous.start < 2) {
      previous.end = Math.max(previous.end, seg.end);
      continue;
    }
    unique.push({ ...seg, end: Math.max(seg.end, seg.start + 0.3) });
  }

  // 2. Texto demais para caber em 2 linhas → divide
  const maxChars = maxLine * maxLines;
  const pieces = unique.flatMap((cue) => splitLongCue(cue, maxChars));

  // 3. Tempos: mínimo, máximo e intervalo entre legendas
  const timed = pieces.map((cue, i) => {
    const next = pieces[i + 1];
    const limit = Math.min(next ? next.start - minGap : Infinity, duration);
    let end = Math.min(cue.end, cue.start + maxDuration);
    if (end - cue.start < minDuration) end = cue.start + minDuration; // fica mais tempo na tela...
    end = Math.min(end, limit); // ...sem invadir a próxima
    if (end - cue.start < 0.3) end = cue.start + 0.3; // fala muito colada: mínimo de 300 ms
    return { ...cue, end };
  });

  // Se ainda sobrou sobreposição (falas coladas), empurra o início da próxima
  for (let i = 1; i < timed.length; i += 1) {
    const previous = timed[i - 1];
    if (timed[i].start < previous.end + minGap) {
      const shift = previous.end + minGap - timed[i].start;
      timed[i] = { ...timed[i], start: timed[i].start + shift, end: Math.max(timed[i].end, timed[i].start + shift + 0.3) };
    }
  }

  // 4. Quebra de linha + numeração
  return timed.map((cue, i) => ({
    id: i + 1,
    start: Math.round(cue.start * 1000) / 1000,
    end: Math.round(cue.end * 1000) / 1000,
    text: wrapText(cue.text, maxLine),
  }));
}

/** Caracteres por segundo (velocidade de leitura; até ~17 é confortável) */
export function readingSpeed(cue) {
  const chars = cue.text.replace(/\n/g, "").length;
  const seconds = Math.max(cue.end - cue.start, 0.001);
  return chars / seconds;
}
