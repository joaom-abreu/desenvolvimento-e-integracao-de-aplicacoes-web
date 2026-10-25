/** Caixa de mensagem: tipo "erro", "sucesso" ou "info". */
export default function Mensagem({ tipo = "info", children }) {
  if (!children) return null;
  return (
    <div className={`mensagem mensagem-${tipo}`} role={tipo === "erro" ? "alert" : "status"}>
      {children}
    </div>
  );
}
