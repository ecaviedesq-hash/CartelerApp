-- Mi Cartelera Personal
-- No se ejecuta en la terminal ni con doble clic.
-- Supabase → tu proyecto → SQL Editor → New query → pegar todo → Run.
-- Si un intento anterior falló a medias, este script se puede volver a correr.

create table if not exists public.mi_lista (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tmdb_id integer not null,
  titulo text not null,
  poster_url text,
  tipo_contenido text not null check (tipo_contenido in ('pelicula', 'serie')),
  estado text not null default 'por_ver' check (estado in ('por_ver', 'viendo', 'vista')),
  calificacion_personal integer check (
    calificacion_personal is null
    or calificacion_personal between 1 and 5
  ),
  comentario text,
  fecha_agregado timestamptz not null default now(),
  constraint mi_lista_titulo_unico unique (user_id, tmdb_id, tipo_contenido)
);

create index if not exists mi_lista_user_fecha_idx
  on public.mi_lista (user_id, fecha_agregado desc);

-- Aunque el cliente envíe otro user_id, la fila queda a nombre de quien inició sesión.
create or replace function public.asignar_dueno_mi_lista()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.user_id := auth.uid();
  else
    new.user_id := old.user_id;
  end if;
  return new;
end;
$$;

drop trigger if exists mi_lista_asignar_dueno on public.mi_lista;

create trigger mi_lista_asignar_dueno
before insert or update on public.mi_lista
for each row
execute function public.asignar_dueno_mi_lista();

alter table public.mi_lista enable row level security;

grant select, insert, update, delete on table public.mi_lista to authenticated;

drop policy if exists "Cada usuario lee solo su lista" on public.mi_lista;
drop policy if exists "Cada usuario agrega solo en su lista" on public.mi_lista;
drop policy if exists "Cada usuario edita solo su lista" on public.mi_lista;
drop policy if exists "Cada usuario elimina solo su lista" on public.mi_lista;

create policy "Cada usuario lee solo su lista"
on public.mi_lista
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Cada usuario agrega solo en su lista"
on public.mi_lista
for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy "Cada usuario edita solo su lista"
on public.mi_lista
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Cada usuario elimina solo su lista"
on public.mi_lista
for delete
to authenticated
using ((select auth.uid()) = user_id);
