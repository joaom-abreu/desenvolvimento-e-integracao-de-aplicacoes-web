/**
 * Caixa de mensagem (sucesso ou erro) usada no formulário.
 *
 * <Message type="error" title="Não foi possível salvar">
 *   O e-mail é obrigatório.
 * </Message>
 */
const Message = ({ type = "success", title, children }) => (
  <div className={`app-message app-message-${type}`} role={type === "error" ? "alert" : "status"}>
    {title && <strong>{title}</strong>}
    {children && <span>{children}</span>}
  </div>
);

export default Message;
