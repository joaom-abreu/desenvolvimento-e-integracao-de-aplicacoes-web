import { supabase } from "../config/supabaseClient";
import Url from "../model/Url";

/**
 * Acesso à tabela "urls" do Supabase.
 *
 * Faz o papel do UrlRepository (Spring Data JPA). A diferença: o papel "anon"
 * (a chave publicável) NÃO lê a tabela direto. Ele só insere; o resto passa
 * pelas funções do supabase_urls.sql, chamadas com supabase.rpc().
 */

const TABELA = "urls";

// Código do Postgres para "valor duplicado em coluna unique"
const UNIQUE_VIOLATION = "23505";

function verificar(error) {
  if (error) {
    throw new Error(`Supabase: ${error.message}`);
  }
}

function cliente() {
  if (!supabase) {
    throw new Error("Supabase não configurado: preencha o .env.local (veja o README).");
  }
  return supabase;
}

/**
 * insert into urls (short_url, original_url, expiration_date, owner_token) values (...)
 *
 * Sem .select() no final: o anon não tem SELECT na tabela, então o insert vai
 * sem RETURNING. Devolve false se o short_url já existir (unique), para o
 * service sortear outro código ou avisar que o alias está em uso.
 */
export async function save({ shortUrl, originalUrl, expirationDate, ownerToken }) {
  const { error } = await cliente()
    .from(TABELA)
    .insert({
      short_url: shortUrl,
      original_url: originalUrl,
      expiration_date: expirationDate,
      owner_token: ownerToken,
    });

  if (error?.code === UNIQUE_VIOLATION) return false;
  verificar(error);
  return true;
}

/**
 * Função resolve_url: busca o link, confere a expiração e conta +1 clique.
 * Devolve null (não existe) ou { originalUrl, expired }.
 */
export async function resolve(shortUrl) {
  const { data, error } = await cliente()
    .rpc("resolve_url", { p_short_url: shortUrl })
    .maybeSingle();
  verificar(error);
  return data ? { originalUrl: data.original_url, expired: data.expired } : null;
}

/** Função list_my_urls: os links criados com este owner_token (mais novos primeiro). */
export async function findAllByOwnerToken(ownerToken) {
  const { data, error } = await cliente().rpc("list_my_urls", { p_owner_token: ownerToken });
  verificar(error);
  return data.map(Url.fromRow);
}

/** Função delete_my_url: só apaga se o owner_token for o de quem criou. */
export async function deleteByShortUrlAndOwnerToken(shortUrl, ownerToken) {
  const { data, error } = await cliente().rpc("delete_my_url", {
    p_short_url: shortUrl,
    p_owner_token: ownerToken,
  });
  verificar(error);
  return data === true;
}
