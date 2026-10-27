-- banc: one JSON document per profile (applied as migration "profiles_data")
create table public.profiles_data (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null,
  version integer not null default 1,
  updated_at timestamptz not null default now()
);

alter table public.profiles_data enable row level security;

create policy "own row select" on public.profiles_data
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own row insert" on public.profiles_data
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own row update" on public.profiles_data
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- Profiles are Supabase auth users "<name>@banc.mercao.de"; password = lower(name) || '#banc-profil'
-- (see src/lib/supabase.ts profilePassword). Created once via SQL in the dashboard.
