// crc16.js
// CRC16-CCITT (polinômio 0x1021, valor inicial 0xFFFF), exigido pelo BR Code
// no campo 63. O cálculo inclui o próprio "6304" do campo.

/**
 * crc16("00020126...6304") → "1D3D"
 * @param {string} payload
 * @returns {string} 4 dígitos hexadecimais em maiúsculas
 */
export function crc16(payload) {
  const bytes = new TextEncoder().encode(payload);
  let crc = 0xffff;

  for (const byte of bytes) {
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}
