/** Rodinha de carregamento. */
export default function Spinner({ label = "Carregando" }) {
  return <span className="cb-spinner" role="status" aria-label={label} />;
}
