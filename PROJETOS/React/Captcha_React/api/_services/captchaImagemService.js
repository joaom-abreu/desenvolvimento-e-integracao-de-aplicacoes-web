// =========================================================
// CAPTCHA DE IMAGEM (gerado pelo próprio projeto)
// ---------------------------------------------------------
// Funciona sem internet e sem cadastro em nenhum serviço.
//
// Fluxo:
//  1. O navegador pede GET /api/captcha-imagem/imagem
//  2. O servidor sorteia um texto e desenha esse texto em
//     um PNG com ruído
//  3. Devolve a imagem + um DESAFIO assinado (ver
//     _lib/desafioAssinado.js). O texto certo nunca vai
//     para o navegador.
//  4. O usuário digita o texto e envia o formulário com o
//     desafio
//  5. O servidor confere e invalida o desafio (cada captcha
//     só vale uma vez)
//
// Campos enviados pelo formulário: captcha + desafio
// =========================================================

import { randomInt } from "node:crypto";
import { conferirDesafio, criarDesafio } from "../_lib/desafioAssinado.js";
import { FONTE, LETRAS } from "../_lib/fonte.js";
import { Tela } from "../_lib/png.js";

const LARGURA = 180;
const ALTURA = 60;

const normalizar = (texto) => String(texto ?? "").trim().toUpperCase();

/** Sorteia um texto novo e devolve { imagem (data URL do PNG), desafio }. */
export function gerarCaptchaImagem(config) {
  const { tamanho } = config.captchaImagem;
  const { hmacKey, validadeMinutos } = config.desafio;

  const texto = Array.from({ length: tamanho }, () => LETRAS[randomInt(LETRAS.length)]).join("");

  const png = desenhar(texto);

  return {
    imagem: `data:image/png;base64,${png.toString("base64")}`,
    desafio: criarDesafio(hmacKey, texto, validadeMinutos),
  };
}

/** Compara o texto digitado (sem diferenciar maiúsculas e minúsculas). */
export function validarCaptchaImagem(config, desafio, resposta) {
  return conferirDesafio(config.desafio.hmacKey, desafio, normalizar(resposta));
}

/* =====================================================================
   Desenho
   ===================================================================== */

function desenhar(texto) {
  const tela = new Tela(LARGURA, ALTURA, [244, 246, 250]);

  // Linhas de ruído ATRÁS do texto
  desenharRuido(tela, 8);

  // Cada letra com tamanho, cor e inclinação diferentes
  let x = 16;
  for (const letra of texto) {
    const unidade = 4.3 + randomInt(10) / 10; // altura da letra: 26 a 31 px
    const cor = [randomInt(90), randomInt(90), 60 + randomInt(110)];
    const angulo = ((randomInt(50) - 25) * Math.PI) / 180;
    const base = 40 + randomInt(10);

    // Centro da letra: em volta dele é feita a rotação
    const cx = x + 2 * unidade;
    const cy = base - 3 * unidade;
    const cos = Math.cos(angulo);
    const sin = Math.sin(angulo);
    const ponto = ([gx, gy]) => {
      const dx = (gx - 2) * unidade;
      const dy = (gy - 3) * unidade;
      return [cx + dx * cos - dy * sin, cy + dx * sin + dy * cos];
    };

    for (const traco of FONTE[letra]) {
      for (let i = 1; i < traco.length; i++) {
        const [x1, y1] = ponto(traco[i - 1]);
        const [x2, y2] = ponto(traco[i]);
        tela.linha(x1, y1, x2, y2, 3.4, cor);
      }
    }

    x += 28 + randomInt(4);
  }

  // Mais algumas linhas POR CIMA do texto
  desenharRuido(tela, 3);

  return tela.png();
}

function desenharRuido(tela, quantidade) {
  for (let i = 0; i < quantidade; i++) {
    const cor = [120 + randomInt(100), 120 + randomInt(100), 120 + randomInt(100)];
    tela.linha(
      randomInt(LARGURA), randomInt(ALTURA),
      randomInt(LARGURA), randomInt(ALTURA),
      1 + randomInt(2), cor
    );
  }
}
