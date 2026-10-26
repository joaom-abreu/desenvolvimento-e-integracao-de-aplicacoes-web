import { useState } from "react";

export const TAMANHO_MAXIMO_NOME = 30;

/** Começo de rodada: o nome é opcional e só serve para o ranking. */
export default function NovaPartidaForm({ nomeInicial = "", onIniciar, ocupado = false }) {
  const [nome, setNome] = useState(nomeInicial);
  const [erro, setErro] = useState(null);

  async function enviar(evento) {
    evento.preventDefault();
    if (nome.trim().length > TAMANHO_MAXIMO_NOME) {
      setErro(`Use até ${TAMANHO_MAXIMO_NOME} caracteres.`);
      return;
    }
    setErro(null);
    try {
      await onIniciar(nome);
    } catch {
      /* a mensagem do back-end aparece na página */
    }
  }

  return (
    <form className="formulario" onSubmit={enviar} noValidate>
      <div className="campo" data-invalido={Boolean(erro)}>
        <label htmlFor="jogador">Seu nome no ranking</label>
        <input
          id="jogador"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Opcional"
          autoComplete="nickname"
          aria-invalid={Boolean(erro)}
          aria-describedby={erro ? "jogador-erro" : "jogador-ajuda"}
        />
        {erro ? (
          <span id="jogador-erro" className="erro-campo">
            {erro}
          </span>
        ) : (
          <span id="jogador-ajuda" className="ajuda-campo">
            Sem nome, você joga como Anônimo.
          </span>
        )}
      </div>
      <button className="botao botao-grande" type="submit" disabled={ocupado}>
        {ocupado ? "Sorteando…" : "Começar rodada"}
      </button>
    </form>
  );
}
