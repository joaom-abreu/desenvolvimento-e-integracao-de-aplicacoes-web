-- Rode no Supabase > SQL Editor (obrigatório: aqui não existe Hibernate para criar a tabela)
create table if not exists public.favorites (
    station_uuid varchar(64) primary key,
    created_at   timestamptz not null default now()
);

-- O React fala com o Supabase pela Data API, usando a chave publicável (pública).
-- Com o RLS ligado, só passa o que as policies abaixo permitirem.
alter table public.favorites enable row level security;

-- Permissões da tabela para os papéis da Data API
grant select, insert, delete on public.favorites to anon, authenticated;

-- Ler os favoritos (getFavoriteUuids / isFavorite)
drop policy if exists "favorites_select" on public.favorites;
create policy "favorites_select" on public.favorites
    for select to anon, authenticated
    using (true);

-- Favoritar (toggle -> insert)
drop policy if exists "favorites_insert" on public.favorites;
create policy "favorites_insert" on public.favorites
    for insert to anon, authenticated
    with check (true);

-- Desfavoritar (toggle -> delete)
drop policy if exists "favorites_delete" on public.favorites;
create policy "favorites_delete" on public.favorites
    for delete to anon, authenticated
    using (true);

-- Sem policy de UPDATE: ninguém consegue alterar uma linha, só inserir ou apagar.
