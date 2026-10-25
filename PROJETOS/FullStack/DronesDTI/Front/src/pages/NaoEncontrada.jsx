import { Link } from "react-router-dom";

export default function NaoEncontrada() {
  return (
    <div className="pagina">
      <div className="vazio" style={{ padding: "80px 12px" }}>
        <strong style={{ fontSize: "2rem" }}>Fora do espaço aéreo</strong>
        <p>Esta página não existe.</p>
        <Link className="botao" to="/">
          Voltar ao centro de operações
        </Link>
      </div>
    </div>
  );
}
