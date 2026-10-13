-- ==========================================================================
-- AraUrlShortener: rode no Supabase > SQL Editor (obrigatório).
--
-- No Spring, o Flyway criava a tabela (V1__create-table-urls.sql) e o
-- UrlService fazia o resto. Aqui não existe servidor: este script cria a
-- tabela, liga o RLS e cria as funções que o React chama pela Data API.
-- Pode rodar de novo sem problema (é idempotente).
-- ==========================================================================


-- --------------------------------------------------------------------------
-- 1. Tabela urls (mesma ideia do V1__create-table-urls.sql)
-- --------------------------------------------------------------------------
create table if not exists public.urls (
    id              bigint generated always as identity primary key,
    short_url       text        not null unique,       -- código curto (aleatório ou alias)
    original_url    text        not null,              -- a URL longa
    expiration_date timestamptz,                       -- opcional (null = nunca expira)
    clicks          bigint      not null default 0,    -- contador de cliques
    owner_token     uuid        not null,              -- "dono" do link (um por navegador)
    created_at      timestamptz not null default now(),

    -- Mesmo alfabeto do generateRandomString (A-Z, a-z, 0-9), mais "-" e "_" nos aliases
    constraint urls_short_url_format
        check (short_url ~ '^[A-Za-z0-9_-]{3,32}$'),

    -- Mesma regra do @Pattern do UrlRequestDTO: só http:// ou https://
    -- (impede links "javascript:..." que virariam XSS no redirecionamento)
    constraint urls_original_url_format
        check (original_url ~* '^https?://\S+$' and char_length(original_url) <= 4096)
);

-- Histórico: "meus links, do mais novo para o mais antigo"
create index if not exists urls_owner_token_idx
    on public.urls (owner_token, created_at desc);


-- --------------------------------------------------------------------------
-- 2. Row Level Security
--
-- A chave publicável fica no navegador, então qualquer visitante fala com a
-- Data API como o papel "anon". Por isso:
--   - ninguém LÊ a tabela direto (não dá para listar os links dos outros);
--   - ninguém ALTERA nem APAGA direto (só pelas funções abaixo);
--   - qualquer um INSERE, mas só nestas 4 colunas (clicks e created_at são do banco).
-- --------------------------------------------------------------------------
alter table public.urls enable row level security;

revoke all on table public.urls from anon, authenticated;

grant insert (short_url, original_url, expiration_date, owner_token)
    on table public.urls to anon, authenticated;

drop policy if exists "urls_insert" on public.urls;
create policy "urls_insert" on public.urls
    for insert to anon, authenticated
    with check (expiration_date is null or expiration_date > now());


-- --------------------------------------------------------------------------
-- 3. resolve_url: o antigo GET /api/{shortUrl} (getAndValidateOriginalUrl)
--
-- Devolve:
--   - nenhuma linha                    -> UrlNotFoundException (404)
--   - (null, expired = true)           -> UrlExpiredException  (410)
--   - (original_url, expired = false)  -> redireciona e conta +1 clique
--
-- "security definer" roda com o dono da função (que enxerga a tabela),
-- mas só faz exatamente o que está escrito aqui.
-- --------------------------------------------------------------------------
create or replace function public.resolve_url(p_short_url text)
returns table (original_url text, expired boolean)
language plpgsql
security definer
set search_path = ''
as $$
begin
    -- Link válido: conta o clique e devolve a URL original (um único UPDATE atômico)
    return query
        update public.urls as u
           set clicks = u.clicks + 1
         where u.short_url = p_short_url
           and (u.expiration_date is null or u.expiration_date > now())
     returning u.original_url, false;

    if found then
        return;
    end if;

    -- O link existe, mas expirou
    return query
        select null::text, true
          from public.urls as u
         where u.short_url = p_short_url;
end;
$$;


-- --------------------------------------------------------------------------
-- 4. list_my_urls: histórico do navegador (owner_token salvo no localStorage)
-- --------------------------------------------------------------------------
create or replace function public.list_my_urls(p_owner_token uuid)
returns table (
    short_url       text,
    original_url    text,
    expiration_date timestamptz,
    clicks          bigint,
    created_at      timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
    select u.short_url, u.original_url, u.expiration_date, u.clicks, u.created_at
      from public.urls as u
     where u.owner_token = p_owner_token
     order by u.created_at desc
     limit 100;
$$;


-- --------------------------------------------------------------------------
-- 5. delete_my_url: só apaga se o owner_token for o mesmo de quem criou
-- --------------------------------------------------------------------------
create or replace function public.delete_my_url(p_short_url text, p_owner_token uuid)
returns boolean
language sql
security definer
set search_path = ''
as $$
    with apagados as (
        delete from public.urls as u
         where u.short_url = p_short_url
           and u.owner_token = p_owner_token
     returning 1
    )
    select exists (select 1 from apagados);
$$;


-- --------------------------------------------------------------------------
-- 6. Quem pode chamar as funções (Data API: /rest/v1/rpc/...)
-- --------------------------------------------------------------------------
revoke execute on function public.resolve_url(text)         from public;
revoke execute on function public.list_my_urls(uuid)        from public;
revoke execute on function public.delete_my_url(text, uuid) from public;

grant execute on function public.resolve_url(text)         to anon, authenticated;
grant execute on function public.list_my_urls(uuid)        to anon, authenticated;
grant execute on function public.delete_my_url(text, uuid) to anon, authenticated;

-- Avisa a Data API (PostgREST) que o esquema mudou
notify pgrst, 'reload schema';
