import { useState } from "react";

const VAZIO = { nome: "", email: "", curso: "" };

/**
 * Formulário de cadastro e edição de aluno.
 *
 * - Sem alunoEmEdicao: cria um aluno novo (POST)
 * - Com alunoEmEdicao: altera o aluno escolhido na lista (PUT)
 *
 * O App.jsx passa uma "key" diferente para cada aluno editado,
 * então o React recria o formulário já preenchido com os dados dele.
 *
 * noValidate: deixamos o Spring Boot validar os campos para você ver
 * a mensagem de erro (400) do GlobalExceptionHandler chegando ao front.
 */
const AlunoForm = ({ alunoEmEdicao, onSalvar, onCancelar, desabilitado }) => {
  const [dados, setDados] = useState(
    alunoEmEdicao ? { nome: alunoEmEdicao.nome, email: alunoEmEdicao.email, curso: alunoEmEdicao.curso ?? "" } : VAZIO,
  );
  const [salvando, setSalvando] = useState(false);

  const editando = Boolean(alunoEmEdicao);

  const handleChange = (evento) => {
    const { name, value } = evento.target;
    setDados((atual) => ({ ...atual, [name]: value }));
  };

  const handleSubmit = async (evento) => {
    evento.preventDefault();
    setSalvando(true);

    const salvou = await onSalvar(dados);

    setSalvando(false);

    // Depois de cadastrar, limpa o formulário para o próximo aluno
    if (salvou && !editando) {
      setDados(VAZIO);
    }
  };

  return (
    <form className="aluno-form" onSubmit={handleSubmit} noValidate>
      <fieldset disabled={desabilitado || salvando}>
        <legend className="aluno-form-legend">{editando ? `Editando ${alunoEmEdicao.nome}` : "Novo aluno"}</legend>

        <label className="campo campo-largo">
          <span>Nome</span>
          <input
            name="nome"
            value={dados.nome}
            onChange={handleChange}
            placeholder="Ex.: Maria Souza"
            autoComplete="off"
          />
        </label>

        <label className="campo">
          <span>E-mail</span>
          <input
            name="email"
            type="email"
            value={dados.email}
            onChange={handleChange}
            placeholder="maria@sga.pucminas.br"
            autoComplete="off"
          />
        </label>

        <label className="campo">
          <span>Curso</span>
          <input
            name="curso"
            value={dados.curso}
            onChange={handleChange}
            placeholder="Engenharia de Software"
            autoComplete="off"
          />
        </label>

        <div className="aluno-form-actions">
          <button type="submit" className="btn btn-primary">
            {salvando ? "Salvando..." : editando ? "Salvar alterações" : "Cadastrar aluno"}
          </button>

          {editando && (
            <button type="button" className="btn btn-secondary" onClick={onCancelar}>
              Cancelar
            </button>
          )}
        </div>
      </fieldset>
    </form>
  );
};

export default AlunoForm;
