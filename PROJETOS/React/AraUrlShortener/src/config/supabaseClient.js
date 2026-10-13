import { createClient } from "@supabase/supabase-js";

/**
 * Cliente do Supabase, criado uma vez só e compartilhado pelo projeto.
 *
 * No Spring, a conexão era JDBC direto no Postgres (usuário + senha do banco).
 * O navegador não consegue abrir uma conexão TCP com o Postgres, então aqui o
 * supabase-js fala com a Data API do Supabase (HTTPS), usando a chave
 * PUBLICÁVEL. Quem protege a tabela são o RLS e as funções do
 * supabase_urls.sql, e não a chave.
 */
const url = import.meta.env.VITE_SUPABASE_URL;
const key =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

/** false quando o .env.local não foi preenchido: a tela abre com um aviso. */
export const supabaseConfigurado = Boolean(url && key);

export const supabase = supabaseConfigurado
  ? createClient(url, key, {
      // Não há login neste projeto: nada de sessão no localStorage.
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;
