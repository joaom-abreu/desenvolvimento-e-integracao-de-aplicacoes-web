// pix.js
// Monta e lê o BR Code do Pix estático ("Pix copia e cola").
//
// Campos usados (Manual de Padrões para Iniciação do Pix, Banco Central):
//
//   00  Payload Format Indicator    "01"
//   01  Point of Initiation Method  "12" = uso único (opcional)
//   26  Merchant Account Info       00 GUI "br.gov.bcb.pix" · 01 chave · 02 descrição
//   52  Merchant Category Code      "0000"
//   53  Transaction Currency        "986" (real)
//   54  Transaction Amount          "25.90" (opcional: sem ele, quem paga digita o valor)
//   58  Country Code                "BR"
//   59  Merchant Name               até 25 caracteres
//   60  Merchant City               até 15 caracteres
//   62  Additional Data             05 txid (até 25 caracteres, "***" se vazio)
//   63  CRC16                       4 dígitos hexadecimais

import PIX_CONFIG from "../config/pixConfig";
import { crc16 } from "./crc16";
import { parseTlv, tlv } from "./emv";
import { PixParseError, PixValidationError } from "./exceptions";
import { detectKeyType, normalizeKey } from "./keys";
import { toAscii, toMerchantText, toTxid } from "./text";

/** Nome de cada campo, para a tabela "Campos do código". */
export const FIELD_NAMES = {
  "00": "Versão do payload",
  "01": "Método de iniciação",
  26: "Conta do recebedor",
  "26.00": "Arranjo (GUI)",
  "26.01": "Chave Pix",
  "26.02": "Descrição",
  52: "Categoria (MCC)",
  53: "Moeda",
  54: "Valor",
  58: "País",
  59: "Nome do recebedor",
  60: "Cidade",
  61: "CEP",
  62: "Dados adicionais",
  "62.05": "Identificador (txid)",
  63: "CRC16",
};

/* ---------------------------------------------------------------
   Valor: "1.234,56" / "1234.56" / "25" → 1234.56
   --------------------------------------------------------------- */

export function parseAmount(raw) {
  const text = String(raw ?? "").trim().replace(/\s|R\$/g, "");
  if (!text) return null;

  // Com vírgula, o padrão é brasileiro: ponto separa milhar e vírgula separa centavos
  const normalized = text.includes(",") ? text.replace(/\./g, "").replace(",", ".") : text;

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new PixValidationError("amount", "Valor inválido. Use, por exemplo, 25,90.");
  }

  const amount = Number(normalized);
  if (amount <= 0) throw new PixValidationError("amount", "O valor precisa ser maior que zero.");
  if (amount > PIX_CONFIG.MAX_AMOUNT) throw new PixValidationError("amount", "Valor alto demais.");
  return amount;
}

/* ---------------------------------------------------------------
   buildPix: dados do formulário → BR Code
   --------------------------------------------------------------- */

/**
 * @param {object} data
 * @param {string} data.keyType     cpf | cnpj | email | phone | random
 * @param {string} data.key
 * @param {string} data.name
 * @param {string} data.city
 * @param {string} [data.amount]    "25,90" (vazio = quem paga digita o valor)
 * @param {string} [data.txid]
 * @param {string} [data.description]
 * @param {boolean} [data.singleUse]
 * @returns {{ payload: string, key: string, name: string, city: string, amount: number|null, txid: string, description: string }}
 * @throws {PixValidationError}
 */
export function buildPix(data) {
  const key = normalizeKey(data.keyType, data.key);

  const name = toMerchantText(data.name, PIX_CONFIG.MAX_NAME);
  if (!name) throw new PixValidationError("name", "Informe o nome de quem recebe.");

  const city = toMerchantText(data.city, PIX_CONFIG.MAX_CITY);
  if (!city) throw new PixValidationError("city", "Informe a cidade de quem recebe.");

  const amount = parseAmount(data.amount);
  const txid = toTxid(data.txid, PIX_CONFIG.MAX_TXID) || PIX_CONFIG.EMPTY_TXID;
  let description = toAscii(data.description);

  // O campo 26 inteiro (GUI + chave + descrição) tem no máximo 99 caracteres
  const accountBase = tlv("00", PIX_CONFIG.GUI) + tlv("01", key);
  const room = PIX_CONFIG.MAX_ACCOUNT_INFO - accountBase.length - 4;
  if (description.length > room) {
    if (room <= 0) description = "";
    else {
      throw new PixValidationError(
        "description",
        `Com essa chave, a descrição pode ter no máximo ${room} caracteres.`
      );
    }
  }
  const accountInfo = accountBase + (description ? tlv("02", description) : "");

  const body =
    tlv("00", "01") +
    (data.singleUse ? tlv("01", "12") : "") +
    tlv("26", accountInfo) +
    tlv("52", "0000") +
    tlv("53", "986") +
    (amount ? tlv("54", amount.toFixed(2)) : "") +
    tlv("58", "BR") +
    tlv("59", name) +
    tlv("60", city) +
    tlv("62", tlv("05", txid)) +
    "6304";

  return {
    payload: body + crc16(body),
    key,
    name,
    city,
    amount,
    txid,
    description,
  };
}

/** Espaço que sobra para a descrição com a chave atual (para o contador do campo). */
export function descriptionRoom(key) {
  const used = tlv("00", PIX_CONFIG.GUI).length + 4 + String(key ?? "").length + 4;
  return Math.max(0, PIX_CONFIG.MAX_ACCOUNT_INFO - used);
}

/* ---------------------------------------------------------------
   explainPayload: BR Code → lista de campos (com subcampos)
   --------------------------------------------------------------- */

const TEMPLATES = new Set(["26", "62"]);

export function explainPayload(payload) {
  return parseTlv(payload).map((field) => {
    const item = { ...field, name: FIELD_NAMES[field.id] ?? `Campo ${field.id}` };

    // Campos 26 a 51 e 62 são "templates": dentro deles há outros campos TLV
    const isAccount = Number(field.id) >= 26 && Number(field.id) <= 51;
    if (isAccount || TEMPLATES.has(field.id)) {
      try {
        item.children = parseTlv(field.value).map((child) => ({
          ...child,
          name: FIELD_NAMES[`${isAccount ? "26" : field.id}.${child.id}`] ?? `Subcampo ${child.id}`,
        }));
      } catch {
        item.children = null;
      }
    }
    return item;
  });
}

/* ---------------------------------------------------------------
   parsePix: "Pix copia e cola" colado → dados + conferência do CRC
   --------------------------------------------------------------- */

/**
 * @returns {{ payload: string, crcOk: boolean, crcExpected: string, crcFound: string,
 *             fields: object[], key: string|null, keyType: string, name: string, city: string,
 *             amount: number|null, txid: string, description: string, singleUse: boolean, dynamicUrl: string|null }}
 * @throws {PixParseError}
 */
export function parsePix(raw) {
  const payload = String(raw ?? "").replace(/[\r\n\t]/g, "").trim();
  if (!payload) throw new PixParseError("Cole um código Pix copia e cola.");
  if (!payload.startsWith("000201")) {
    throw new PixParseError('Isto não parece um código Pix: ele sempre começa com "000201".');
  }

  let fields;
  try {
    fields = explainPayload(payload);
  } catch (error) {
    throw new PixParseError(`Código malformado. ${error.message}`);
  }

  const crcField = fields.at(-1);
  if (crcField?.id !== "63" || crcField.size !== 4) {
    throw new PixParseError("O código precisa terminar com o campo 63 (CRC16, 4 caracteres).");
  }

  const crcExpected = crc16(payload.slice(0, -4));
  const get = (id) => fields.find((f) => f.id === id);
  const sub = (field, id) => field?.children?.find((c) => c.id === id)?.value ?? "";

  // A conta Pix fica no primeiro campo entre 26 e 51 com o GUI do Pix
  const account = fields.find(
    (f) => Number(f.id) >= 26 && Number(f.id) <= 51 && sub(f, "00").toLowerCase() === PIX_CONFIG.GUI
  );
  if (!account) throw new PixParseError('O código não tem a conta Pix ("br.gov.bcb.pix").');

  const key = sub(account, "01") || null;
  const amountText = get("54")?.value;

  return {
    payload,
    fields,
    crcOk: crcExpected === crcField.value.toUpperCase(),
    crcExpected,
    crcFound: crcField.value,
    key,
    keyType: key ? detectKeyType(key) : "dynamic",
    dynamicUrl: sub(account, "25") || null, // Pix dinâmico: URL em vez de chave
    description: sub(account, "02"),
    name: get("59")?.value ?? "",
    city: get("60")?.value ?? "",
    amount: amountText ? Number(amountText) : null,
    txid: sub(get("62"), "05"),
    singleUse: get("01")?.value === "12",
  };
}

/* ---------------------------------------------------------------
   validatePix: todos os erros do formulário de uma vez
   --------------------------------------------------------------- */

/**
 * validatePix({ key: "", name: "Ana", ... }) → { key: "Informe a chave Pix." }
 * @returns {Record<string, string>} vazio quando está tudo certo
 */
export function validatePix(data) {
  const errors = {};
  const check = (fn) => {
    try {
      fn();
    } catch (error) {
      if (!(error instanceof PixValidationError)) throw error;
      errors[error.field] ??= error.message;
    }
  };

  check(() => normalizeKey(data.keyType, data.key));
  check(() => {
    if (!toMerchantText(data.name, PIX_CONFIG.MAX_NAME)) {
      throw new PixValidationError("name", "Informe o nome de quem recebe.");
    }
  });
  check(() => {
    if (!toMerchantText(data.city, PIX_CONFIG.MAX_CITY)) {
      throw new PixValidationError("city", "Informe a cidade de quem recebe.");
    }
  });
  check(() => parseAmount(data.amount));
  if (!errors.key) check(() => buildPix(data)); // descrição longa demais para a chave

  return errors;
}
