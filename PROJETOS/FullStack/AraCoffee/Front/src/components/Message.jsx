/**
 * Caixa de mensagem (sucesso, erro ou informação).
 *
 * <Message type="error" title="Não foi possível salvar">
 *   O nome do produto é obrigatório.
 * </Message>
 */
const Message = ({ type = "success", title, children }) => {
  const classe = { success: "mensagem-sucesso", error: "mensagem-erro", info: "mensagem-info" }[type];

  return (
    <div className={`mensagem ${classe}`} role={type === "error" ? "alert" : "status"}>
      {title && <strong>{title}</strong>}
      {children && <span>{children}</span>}
    </div>
  );
};

export default Message;
