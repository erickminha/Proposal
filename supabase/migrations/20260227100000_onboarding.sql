-- Onboarding transacional e idempotente para novos usuários.
-- 1) cria organizations
-- 2) cria/atualiza profiles com role owner

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete set null,
  role text not null default 'member',
  created_at timestamptz not null default now()
);

alter table public.organizations enable row level security;
alter table public.profiles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'organizations' and policyname = 'Usuário autenticado pode criar organização'
  ) then
    create policy "Usuário autenticado pode criar organização"
      on public.organizations
      for insert
      to authenticated
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'organizations' and policyname = 'Usuário autenticado pode ler organizações'
  ) then
    create policy "Usuário autenticado pode ler organizações"
      on public.organizations
      for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'Usuário lê próprio profile'
  ) then
    create policy "Usuário lê próprio profile"
      on public.profiles
      for select
      to authenticated
      using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'Usuário atualiza próprio profile'
  ) then
    create policy "Usuário atualiza próprio profile"
      on public.profiles
      for update
      to authenticated
      using (auth.uid() = id)
      with check (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'Usuário cria próprio profile'
  ) then
    create policy "Usuário cria próprio profile"
      on public.profiles
      for insert
      to authenticated
      with check (auth.uid() = id);
  end if;
end $$;

create or replace function public.complete_onboarding(p_company_name text default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_org_id uuid;
  v_company_name text;
begin
  if v_user_id is null then
    raise exception 'Usuário não autenticado';
  end if;

  v_company_name := coalesce(
    nullif(trim(p_company_name), ''),
    nullif(trim(auth.jwt() -> 'user_metadata' ->> 'company_name'), ''),
    'Minha empresa'
  );

  select p.organization_id
    into v_org_id
    from public.profiles p
   where p.id = v_user_id;

  if v_org_id is null then
    insert into public.organizations (name)
    values (v_company_name)
    returning id into v_org_id;
  end if;

  insert into public.profiles (id, organization_id, role)
  values (v_user_id, v_org_id, 'owner')
  on conflict (id) do update
    set organization_id = coalesce(public.profiles.organization_id, excluded.organization_id),
        role = 'owner';
end;
$$;

grant execute on function public.complete_onboarding(text) to authenticated;
