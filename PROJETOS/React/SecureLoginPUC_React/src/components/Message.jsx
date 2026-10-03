/**
 * Caixa de mensagem (sucesso ou erro) usada nos formulários.
 *
 * <Message type="error" title="Usuário ou senha incorretos!">
 *   Verifique seus dados e tente novamente.
 * </Message>
 */
const Message = ({ type = "success", title, children, className = "" }) => (
  <div
    className={`auth-message auth-message-${type} ${className}`.trim()}
    role={type === "error" ? "alert" : "status"}
  >
    {title && <strong>{title}</strong>}
    {children && <span>{children}</span>}
  </div>
);

export default Message;
