/**
 * Gera o código JSX de exemplo a partir das props do efeito.
 * Assim o código mostrado na tela é sempre igual ao que está rodando.
 */

// Converte um valor JS no formato de prop JSX
const formatValue = (value) => {
  if (typeof value === "string") return `"${value}"`;
  if (Array.isArray(value)) return `{[${value.map(formatValue).join(", ")}]}`;
  if (value && typeof value === "object") {
    const fields = Object.entries(value).map(([k, v]) => `${k}: ${v}`);
    return `{{ ${fields.join(", ")} }}`;
  }
  return `{${value}}`;
};

const buildCode = ({ name, props, layer }) => {
  const importLine = `import ${name} from "./components/reactbits/${name}/${name}";`;
  const indent = layer === "frente" ? "" : "  ";

  const propLines = Object.entries(props)
    .map(([key, value]) => `${indent}  ${key}=${formatValue(value)}`)
    .join("\n");

  const tag = `${indent}<${name}\n${propLines}\n${indent}/>`;

  if (layer === "frente") {
    return `${importLine}

// O ${name} já é position: fixed e não bloqueia cliques:
// basta colocá-lo em qualquer lugar do App.
${tag}`;
  }

  return `${importLine}

// CSS: .background-effect { position: fixed; inset: 0;
//                           z-index: 0; pointer-events: none; }
<div className="background-effect" aria-hidden="true">
${tag}
</div>`;
};

export default buildCode;
