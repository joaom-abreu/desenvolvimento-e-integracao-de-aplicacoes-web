/**
 * Markdown bem simples para as respostas do Gemini, sem innerHTML
 * (nada que venha da IA vira HTML de verdade, então não há risco de XSS):
 *   **negrito**, *itálico*, `código`, listas com "- " ou "1. " e parágrafos.
 */

// **negrito**, *itálico* e `código` dentro de uma linha
function inline(text, keyPrefix) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`;
    if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={key}>{part.slice(2, -2)}</strong>;
    if (/^`[^`]+`$/.test(part)) return <code key={key}>{part.slice(1, -1)}</code>;
    if (/^\*[^*]+\*$/.test(part)) return <em key={key}>{part.slice(1, -1)}</em>;
    return part;
  });
}

export default function MarkdownText({ text }) {
  const blocks = [];
  let list = null;

  text.split("\n").forEach((raw) => {
    const line = raw.trimEnd();
    const bullet = /^\s*[-*•]\s+(.*)$/.exec(line);
    const numbered = /^\s*\d+[.)]\s+(.*)$/.exec(line);

    if (bullet || numbered) {
      const type = bullet ? "ul" : "ol";
      if (!list || list.type !== type) {
        list = { type, items: [] };
        blocks.push(list);
      }
      list.items.push((bullet ?? numbered)[1]);
      return;
    }

    list = null;
    if (line.trim()) blocks.push({ type: "p", text: line.replace(/^#+\s*/, "") });
  });

  return blocks.map((block, i) => {
    if (block.type === "p") return <p key={i}>{inline(block.text, i)}</p>;
    const List = block.type;
    return (
      <List key={i}>
        {block.items.map((item, j) => (
          <li key={j}>{inline(item, `${i}-${j}`)}</li>
        ))}
      </List>
    );
  });
}
