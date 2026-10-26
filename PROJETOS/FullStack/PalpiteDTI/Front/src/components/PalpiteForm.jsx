import { useEffect, useRef, useState } from "react";
import { validarPalpite } from "../utils/validacao.js";

/**
 * Campo do palpite. Valida na tela (vazio, inteiro, faixa, repetido) e manda o número
 * para o back-end, que é quem diz "maior", "menor" ou "acertou".
 *
 * "escolhido" vem do clique no tabuleiro: { numero, vez } (vez muda a cada clique).
 */
export default function PalpiteForm({ minimo, maximo, jaTentados = [], onPalpitar, ocupado = false, escolhido }) {
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState(null);
  const campo = useRef(null);

  useEffect(() => {
    if (escolhido) {
      setTexto(String(escolhido.numero));
      setErro(null);
      campo.current?.focus();
    }
  }, [escolhido]);

  async function enviar(evento) {
    evento.preventDefault();
    const { numero, erro: problema } = validarPalpite(texto, { minimo, maximo, jaTentados });
    if (problema) {
      setErro(problema);
      campo.current?.focus();
      return;
    }
    setErro(null);
    try {
      await onPalpitar(numero);
      setTexto("");
    } catch {
      /* a mensagem do back-end aparece na página (Mensagem de erro) */
    }
    campo.current?.focus();
  }

  return (
    <form className="formulario palpite-form" onSubmit={enviar} noValidate>
      <div className="campo" data-invalido={Boolean(erro)}>
        <label htmlFor="palpite">
          Seu palpite ({minimo} a {maximo})
        </label>
        <div className="palpite-linha">
          <input
            id="palpite"
            ref={campo}
            inputMode="numeric"
            autoComplete="off"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            aria-invalid={Boolean(erro)}
            aria-describedby={erro ? "palpite-erro" : "palpite-ajuda"}
            disabled={ocupado}
            autoFocus
          />
          <button className="botao botao-grande" type="submit" disabled={ocupado}>
            {ocupado ? "Enviando…" : "Chutar"}
          </button>
        </div>
        {erro ? (
          <span id="palpite-erro" className="erro-campo">
            {erro}
          </span>
        ) : (
          <span id="palpite-ajuda" className="ajuda-campo">
            Digite e aperte Enter, ou clique num número do tabuleiro.
          </span>
        )}
      </div>
    </form>
  );
}
