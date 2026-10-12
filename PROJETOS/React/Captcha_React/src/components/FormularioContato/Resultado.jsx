/**
 * Mensagem depois do envio: "Validado" (verde) ou "Bloqueado" (vermelho).
 * É o mesmo texto que o servidor mandou.
 */
const Resultado = ({ resultado }) => {
  if (!resultado) return null;

  const { sucesso, mensagem } = resultado;

  return (
    <div className={`resultado ${sucesso ? "resultado-ok" : "resultado-erro"}`} role="status">
      <strong>{sucesso ? "Validado" : "Bloqueado"}</strong>
      <span>{mensagem}</span>
    </div>
  );
};

export default Resultado;
