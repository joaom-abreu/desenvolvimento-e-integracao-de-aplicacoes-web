// =========================================================
// TELA + PNG (o "java.awt" deste projeto)
// ---------------------------------------------------------
// Uma tela RGB bem simples que sabe desenhar linhas grossas
// com antisserrilhado e se salvar como PNG. Usa só o Node:
// node:zlib para compactar. Sem canvas, sem biblioteca.
// =========================================================

import { deflateSync } from "node:zlib";

export class Tela {
  constructor(largura, altura, fundo = [255, 255, 255]) {
    this.largura = largura;
    this.altura = altura;
    this.pixels = new Uint8Array(largura * altura * 3);
    for (let i = 0; i < this.pixels.length; i += 3) this.pixels.set(fundo, i);
  }

  /** Mistura a cor no pixel (x, y) com a opacidade "alfa" (0 a 1). */
  pintar(x, y, [r, g, b], alfa) {
    if (x < 0 || y < 0 || x >= this.largura || y >= this.altura || alfa <= 0) return;
    const i = (y * this.largura + x) * 3;
    const p = this.pixels;
    p[i] += (r - p[i]) * alfa;
    p[i + 1] += (g - p[i + 1]) * alfa;
    p[i + 2] += (b - p[i + 2]) * alfa;
  }

  /**
   * Linha de (x1, y1) até (x2, y2) com pontas arredondadas.
   * Para cada pixel perto da linha, mede a distância até ela: quanto mais
   * perto, mais forte a cor. É isso que deixa a borda suave.
   */
  linha(x1, y1, x2, y2, espessura, cor) {
    const raio = espessura / 2;
    const minX = Math.floor(Math.min(x1, x2) - raio - 1);
    const maxX = Math.ceil(Math.max(x1, x2) + raio + 1);
    const minY = Math.floor(Math.min(y1, y2) - raio - 1);
    const maxY = Math.ceil(Math.max(y1, y2) + raio + 1);

    const dx = x2 - x1;
    const dy = y2 - y1;
    const tamanho2 = dx * dx + dy * dy || 1;

    for (let y = minY; y <= maxY; y++) {
      for (let x = minX; x <= maxX; x++) {
        const px = x + 0.5;
        const py = y + 0.5;
        // Ponto da linha mais perto do centro do pixel
        const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / tamanho2));
        const distancia = Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
        const cobertura = Math.min(1, raio + 0.5 - distancia);
        this.pintar(x, y, cor, cobertura);
      }
    }
  }

  /** Converte a tela em um arquivo PNG (Buffer). */
  png() {
    const { largura, altura, pixels } = this;
    const linhaBytes = largura * 3;

    // Cada linha do PNG começa com 1 byte de "filtro" (0 = nenhum)
    const bruto = Buffer.alloc((linhaBytes + 1) * altura);
    for (let y = 0; y < altura; y++) {
      bruto[y * (linhaBytes + 1)] = 0;
      bruto.set(pixels.subarray(y * linhaBytes, (y + 1) * linhaBytes), y * (linhaBytes + 1) + 1);
    }

    const cabecalho = Buffer.alloc(13);
    cabecalho.writeUInt32BE(largura, 0);
    cabecalho.writeUInt32BE(altura, 4);
    cabecalho[8] = 8; // 8 bits por canal
    cabecalho[9] = 2; // RGB
    // compressão, filtro e entrelaçamento: 0

    return Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), // assinatura PNG
      bloco("IHDR", cabecalho),
      bloco("IDAT", deflateSync(bruto)),
      bloco("IEND", Buffer.alloc(0)),
    ]);
  }
}

/* ---------- Blocos (chunks) do PNG: tamanho + tipo + dados + CRC ---------- */

const TABELA_CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = TABELA_CRC[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function bloco(tipo, dados) {
  const tamanho = Buffer.alloc(4);
  tamanho.writeUInt32BE(dados.length);
  const tipoEDados = Buffer.concat([Buffer.from(tipo, "ascii"), dados]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(tipoEDados));
  return Buffer.concat([tamanho, tipoEDados, crc]);
}
