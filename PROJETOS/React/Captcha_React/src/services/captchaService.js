// Chamadas do navegador para a pasta api/ (o "back-end" do projeto).

async function lerJson(resposta, rota) {
  const tipo = resposta.headers.get("content-type") ?? "";

  // Sem as funções (ex.: site estático sem /api), a rota devolve o index.html
  if (tipo.includes("text/html")) {
    throw new Error(`A rota ${rota} não existe aqui. Rode com npm run dev ou publique na Vercel.`);
  }
  return resposta.json();
}

/**
 * Envia o formulário de contato + o campo do captcha e devolve
 * { sucesso, mensagem } (o mesmo que o Spring mostrava na página).
 *
 * enviarFormulario("/api/hcaptcha", { nome, mensagem, "h-captcha-response": token })
 */
export async function enviarFormulario(rota, dados) {
  try {
    const resposta = await fetch(rota, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    const json = await lerJson(resposta, rota);
    return { sucesso: json.sucesso === true, mensagem: json.mensagem ?? `HTTP ${resposta.status}` };
  } catch (erro) {
    return { sucesso: false, mensagem: erro.message || "Sem conexão com o servidor." };
  }
}

/** GET de um desafio novo: { imagem, desafio } ou { pergunta, desafio }. */
export async function buscarDesafio(rota) {
  const resposta = await fetch(rota, { cache: "no-store" });
  if (!resposta.ok) throw new Error(`HTTP ${resposta.status}`);
  return lerJson(resposta, rota);
}
