/** Iniciais do nome para o "avatar" (ex.: "Maria Souza" → "MS") */
const iniciais = (nome = "") =>
  nome
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join("");

/**
 * Lista de alunos vinda do GET /api/alunos, com busca por nome,
 * botão de editar (PUT) e de excluir (DELETE).
 */
const AlunoList = ({ alunos, carregando, busca, onBuscaChange, onEditar, onExcluir, idEmEdicao, desabilitado }) => {
  const renderConteudo = () => {
    if (desabilitado) {
      return (
        <p className="aluno-list-empty">
          A lista aparece aqui assim que o back-end e o MongoDB Atlas estiverem conectados.
        </p>
      );
    }

    if (carregando) {
      return <p className="aluno-list-empty">Carregando alunos do MongoDB...</p>;
    }

    if (alunos.length === 0) {
      return (
        <p className="aluno-list-empty">
          {busca.trim()
            ? `Nenhum aluno com "${busca.trim()}" no nome.`
            : "Nenhum aluno cadastrado ainda. Preencha o formulário acima para criar o primeiro."}
        </p>
      );
    }

    return (
      <ul className="aluno-list">
        {alunos.map((aluno) => (
          <li key={aluno.id} className={aluno.id === idEmEdicao ? "aluno-item aluno-item-ativo" : "aluno-item"}>
            <span className="aluno-avatar" aria-hidden="true">
              {iniciais(aluno.nome)}
            </span>

            <div className="aluno-info">
              <strong>{aluno.nome}</strong>
              <span>{aluno.email}</span>
              {aluno.curso && <span className="aluno-curso">{aluno.curso}</span>}
            </div>

            <div className="aluno-actions">
              <button type="button" className="btn btn-secondary btn-small" onClick={() => onEditar(aluno)}>
                Editar
              </button>
              <button type="button" className="btn btn-danger btn-small" onClick={() => onExcluir(aluno)}>
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <section className="aluno-section" aria-labelledby="titulo-lista">
      <div className="aluno-section-header">
        <h2 id="titulo-lista">
          Alunos cadastrados <span className="aluno-count">{alunos.length}</span>
        </h2>

        <input
          type="search"
          className="aluno-busca"
          value={busca}
          onChange={(evento) => onBuscaChange(evento.target.value)}
          placeholder="Buscar por nome"
          aria-label="Buscar aluno por nome"
          disabled={desabilitado}
        />
      </div>

      {renderConteudo()}
    </section>
  );
};

export default AlunoList;
