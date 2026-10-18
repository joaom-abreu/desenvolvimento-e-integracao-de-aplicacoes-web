// emv.js
// O BR Code segue o padrão EMV® QRCPS-MPM: uma sequência de campos TLV
// (Tag-Length-Value). Cada campo = ID (2 dígitos) + tamanho (2 dígitos) + valor.
//
//   "5802BR"  →  ID 58 · tamanho 02 · valor "BR"

/**
 * Monta um campo TLV. O tamanho conta caracteres (o BR Code só usa ASCII).
 * tlv("58", "BR") → "5802BR"
 */
export function tlv(id, value) {
  const size = String(value.length).padStart(2, "0");
  if (value.length > 99) {
    throw new RangeError(`O campo ${id} passou de 99 caracteres.`);
  }
  return `${id}${size}${value}`;
}

/**
 * Lê uma sequência de campos TLV.
 * parseTlv("5802BR5913Fulano de Tal") → [{ id: "58", size: 2, value: "BR" }, ...]
 * @returns {{ id: string, size: number, value: string, start: number }[]}
 */
export function parseTlv(text) {
  const fields = [];
  let pos = 0;

  while (pos < text.length) {
    const id = text.slice(pos, pos + 2);
    const sizeText = text.slice(pos + 2, pos + 4);

    if (!/^\d{2}$/.test(id) || !/^\d{2}$/.test(sizeText)) {
      throw new SyntaxError(`Campo inválido na posição ${pos + 1}.`);
    }

    const size = Number(sizeText);
    const value = text.slice(pos + 4, pos + 4 + size);

    if (value.length !== size) {
      throw new SyntaxError(`O campo ${id} diz ter ${size} caracteres, mas o texto acabou antes.`);
    }

    fields.push({ id, size, value, start: pos });
    pos += 4 + size;
  }

  return fields;
}
