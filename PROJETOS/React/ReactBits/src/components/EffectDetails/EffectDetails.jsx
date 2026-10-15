import { TbClick, TbExternalLink } from "react-icons/tb";
import CodeBlock from "../CodeBlock/CodeBlock";
import buildCode from "./buildCode";
import "./EffectDetails.css";

// Mostra o valor da prop na tabela
const showValue = (value) =>
  typeof value === "object" ? JSON.stringify(value) : String(value);

/**
 * Explicação do efeito escolhido: o que faz, como testar,
 * o código para copiar e a tabela com as props usadas.
 */
const EffectDetails = ({ effect }) => {
  const { icon: Icon, name, category, layer, docs, description, tip, props, propsInfo } =
    effect;

  return (
    <article className="effect-details">
      <header className="effect-details-header">
        <span className="effect-details-icon">
          <Icon aria-hidden="true" />
        </span>

        <div className="effect-details-title">
          <h2>{name}</h2>
          <p>
            React Bits / {category} /{" "}
            {layer === "frente" ? "por cima do conteúdo" : "atrás do conteúdo"}
          </p>
        </div>

        <a className="effect-details-docs" href={docs} target="_blank" rel="noreferrer">
          Ver no reactbits.dev
          <TbExternalLink aria-hidden="true" />
        </a>
      </header>

      <p className="effect-details-description">{description}</p>

      <p className="effect-details-tip">
        <TbClick aria-hidden="true" />
        {tip}
      </p>

      <h3>Como usar</h3>
      <CodeBlock title={`App.jsx (${name})`} code={buildCode(effect)} />

      <h3>Props usadas neste exemplo</h3>
      <div className="effect-details-table">
        <table>
          <thead>
            <tr>
              <th>Prop</th>
              <th>Valor</th>
              <th>O que faz</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(props).map(([key, value]) => (
              <tr key={key}>
                <td>
                  <code>{key}</code>
                </td>
                <td>
                  <code>{showValue(value)}</code>
                </td>
                <td>{propsInfo[key]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
};

export default EffectDetails;
