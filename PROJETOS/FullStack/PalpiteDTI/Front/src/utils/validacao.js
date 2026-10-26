/**
 * Validação do campo de palpite NA TELA, para dar resposta imediata.
 * Ela não decide nada do jogo: maior, menor ou acertou é sempre o back-end.
 * O back-end repete estas checagens (400/422), porque o front pode ser burlado.
 *
 * Devolve { numero } quando está tudo certo ou { erro } com a mensagem.
 */
export function validarPalpite(texto, { minimo, maximo, jaTentados = [] }) {
  const limpo = String(texto ?? "").trim();
  if (limpo === "") return { erro: "Digite um número." };
  if (!/^-?\d+$/.test(limpo)) return { erro: "Use um número inteiro, sem vírgula nem letras." };

  const numero = Number(limpo);
  if (numero < minimo || numero > maximo) return { erro: `Escolha um número entre ${minimo} e ${maximo}.` };
  if (jaTentados.includes(numero)) return { erro: `Você já tentou o ${numero}. Escolha outro.` };
  return { numero };
}
