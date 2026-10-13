import APP_CONFIG from "../config/appConfig";
import {
  AliasAlreadyExistsException,
  InvalidOptionException,
  InvalidUrlException,
  UrlExpiredException,
  UrlNotFoundException,
} from "../core/exceptions";
import Url from "../model/Url";
import * as urlRepository from "../repository/urlRepository";
import { getOwnerToken } from "../utils/storage";

/**
 * Regras do encurtador. Mesmas funções do UrlService.java
 * (generateShortUrl, getAndValidateOriginalUrl, generateRandomString),
 * mais o histórico, a exclusão, o alias e as validações que no Spring
 * ficavam no UrlRequestDTO.
 */

const { CHARACTERS, SHORT_URL_LENGTH, MAX_ATTEMPTS, ALIAS_PATTERN, MAX_URL_LENGTH, SHORT_URL_BASE } =
  APP_CONFIG;

/* ==========================================================================
   VALIDAÇÕES (o antigo UrlRequestDTO)
   ========================================================================== */

/**
 * Confere e normaliza a URL longa.
 * - aceita "exemplo.com/abc" e completa com https://
 * - só http:// e https:// (o @Pattern do Spring; impede "javascript:...")
 * - recusa links do próprio AraUrl (evita link curto apontando para link curto)
 */
export function normalizeUrl(valor) {
  let texto = (valor ?? "").trim();
  if (!texto) throw new InvalidUrlException("Cole a URL que você quer encurtar.");

  // Sem esquema ("exemplo.com/abc", "site.com:8080/x"): completa com https://.
  // "algo:" seguido de número é host:porta; seguido de letra é outro esquema
  // (javascript:, mailto:, data:...), que o próximo passo recusa.
  if (!/^[a-z][a-z\d+.-]*:(?!\d)/i.test(texto)) {
    texto = `https://${texto}`;
  }

  let url;
  try {
    url = new URL(texto);
  } catch {
    throw new InvalidUrlException();
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new InvalidUrlException("Só dá para encurtar links http:// ou https://.");
  }
  if (!url.hostname.includes(".") && url.hostname !== "localhost") {
    throw new InvalidUrlException();
  }
  if (url.host === new URL(SHORT_URL_BASE).host) {
    throw new InvalidUrlException("Esse endereço já é um link do AraUrl.");
  }
  if (url.href.length > MAX_URL_LENGTH) {
    throw new InvalidUrlException(`A URL passa de ${MAX_URL_LENGTH} caracteres.`);
  }
  return url.href;
}

/** Alias opcional: vazio = null; senão, letras, números, "-" e "_" (3 a 32). */
export function normalizeAlias(valor) {
  const alias = (valor ?? "").trim();
  if (!alias) return null;
  if (!ALIAS_PATTERN.test(alias)) {
    throw new InvalidOptionException(
      'Alias inválido: use de 3 a 32 letras, números, "-" ou "_" (sem espaços nem acentos).'
    );
  }
  return alias;
}

/** Data de expiração opcional (valor do <input type="datetime-local">): precisa ser no futuro. */
export function normalizeExpirationDate(valor) {
  if (!valor) return null;
  const data = new Date(valor);
  if (Number.isNaN(data.getTime())) {
    throw new InvalidOptionException("Data de expiração inválida.");
  }
  if (data <= new Date()) {
    throw new InvalidOptionException("A data de expiração precisa estar no futuro.");
  }
  return data;
}

/* ==========================================================================
   ENCURTAR (o antigo POST /api/shorten)
   ========================================================================== */

/**
 * Cria uma string aleatória com letras maiúsculas, minúsculas e dígitos,
 * como o generateRandomString do Spring (SecureRandom -> crypto.getRandomValues).
 *
 * Bytes >= 248 são descartados: 248 é o maior múltiplo de 62 abaixo de 256,
 * então todos os caracteres saem com a mesma chance (sem "viés do módulo").
 */
export function generateRandomString(length = SHORT_URL_LENGTH) {
  const limite = 256 - (256 % CHARACTERS.length);
  let resultado = "";

  while (resultado.length < length) {
    const bytes = crypto.getRandomValues(new Uint8Array(length * 2));
    for (const byte of bytes) {
      if (byte < limite && resultado.length < length) {
        resultado += CHARACTERS[byte % CHARACTERS.length];
      }
    }
  }
  return resultado;
}

/**
 * Gera e salva o link curto.
 *
 * No Spring, o do/while consultava o banco (findByShortUrl) antes de salvar.
 * Aqui o anon não lê a tabela, então tentamos inserir direto: se o código já
 * existir, o "unique" do banco recusa e sorteamos outro. É até mais seguro:
 * não existe a janela entre "consultar" e "salvar".
 */
export async function generateShortUrl(urlLonga, { alias, expirationDate } = {}) {
  const originalUrl = normalizeUrl(urlLonga);
  const aliasValido = normalizeAlias(alias);
  const expiracao = normalizeExpirationDate(expirationDate);
  const ownerToken = getOwnerToken();

  const salvar = async (shortUrl) => {
    const salvo = await urlRepository.save({
      shortUrl,
      originalUrl,
      expirationDate: expiracao ? expiracao.toISOString() : null,
      ownerToken,
    });
    return salvo ? new Url({ shortUrl, originalUrl, expirationDate: expiracao }) : null;
  };

  if (aliasValido) {
    const url = await salvar(aliasValido);
    if (!url) throw new AliasAlreadyExistsException(aliasValido);
    return url;
  }

  for (let tentativa = 1; tentativa <= MAX_ATTEMPTS; tentativa++) {
    const url = await salvar(generateRandomString(SHORT_URL_LENGTH));
    if (url) return url;
  }
  throw new Error("Não foi possível gerar um código livre. Tente de novo.");
}

/* ==========================================================================
   REDIRECIONAR (o antigo GET /api/{shortUrl})
   ========================================================================== */

/**
 * Devolve a URL original e conta +1 clique.
 * Lança UrlNotFoundException (404) ou UrlExpiredException (410), como no Spring.
 */
export async function getAndValidateOriginalUrl(shortUrl) {
  // Código fora do formato nem vai ao banco
  if (!ALIAS_PATTERN.test(shortUrl ?? "")) throw new UrlNotFoundException();

  const resultado = await urlRepository.resolve(shortUrl);
  if (!resultado) throw new UrlNotFoundException();
  if (resultado.expired) throw new UrlExpiredException();

  // Defesa extra (o banco já garante): só redireciona para http/https
  const { protocol } = new URL(resultado.originalUrl);
  if (protocol !== "http:" && protocol !== "https:") throw new UrlNotFoundException();

  return resultado.originalUrl;
}

/* ==========================================================================
   HISTÓRICO
   ========================================================================== */

/** Links criados neste navegador (mais novos primeiro, até 100). */
export async function listMyUrls() {
  return urlRepository.findAllByOwnerToken(getOwnerToken());
}

/** Exclui um link criado neste navegador. Devolve true se apagou. */
export async function deleteMyUrl(shortUrl) {
  return urlRepository.deleteByShortUrlAndOwnerToken(shortUrl, getOwnerToken());
}

/** Monta o link completo: https://araurl.vercel.app/Ab3xYz */
export function buildShortLink(shortUrl) {
  return `${SHORT_URL_BASE}/${shortUrl}`;
}
