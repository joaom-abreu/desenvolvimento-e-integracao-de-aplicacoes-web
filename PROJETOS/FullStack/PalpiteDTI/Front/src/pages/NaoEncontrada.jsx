import { Link } from "react-router-dom";

export default function NaoEncontrada() {
  return (
    <div className="pagina">
      <div className="vazio" style={{ padding: "80px 12px" }}>
        <strong style={{ fontSize: "2rem" }}>404 está fora do tabuleiro</strong>
        <p>Esta página não existe.</p>
        <Link className="botao" to="/">
          Voltar para o jogo
        </Link>
      </div>
    </div>
  );
}
