-- Corrige recursão infinita de RLS envolvendo user_profiles e estabiliza policies de propostas.

begin;

-- 1) Se existir tabela legacy user_profiles, recria policies sem auto-referência.
do $$
declare
  p record;
begin
  if to_regclass('public.user_profiles') is not null then
    alter table public.user_profiles enable row level security;

    for p in
      select policyname
      from pg_policies
      where schemaname = 'public'
        and tablename = 'user_profiles'
    loop
      execute format('drop policy if exists %I on public.user_profiles', p.policyname);
    end loop;

    create policy user_profiles_select_own
      on public.user_profiles
      for select
      to authenticated
      using (id = auth.uid());

    create policy user_profiles_insert_own
      on public.user_profiles
      for insert
      to authenticated
      with check (id = auth.uid());

    create policy user_profiles_update_own
      on public.user_profiles
      for update
      to authenticated
      using (id = auth.uid())
      with check (id = auth.uid());
  end if;
end
$$;

-- 2) Reforça policies de propostas sem depender de user_profiles.
do $$
declare
  p record;
begin
  if to_regclass('public.propostas') is not null then
    alter table public.propostas enable row level security;

    for p in
      select policyname
      from pg_policies
      where schemaname = 'public'
        and tablename = 'propostas'
    loop
      execute format('drop policy if exists %I on public.propostas', p.policyname);
    end loop;

    create policy propostas_select_own
      on public.propostas
      for select
      to authenticated
      using (auth.uid() = user_id);

    create policy propostas_insert_own
      on public.propostas
      for insert
      to authenticated
      with check (auth.uid() = user_id);

    create policy propostas_update_own
      on public.propostas
      for update
      to authenticated
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);

    create policy propostas_delete_own
      on public.propostas
      for delete
      to authenticated
      using (auth.uid() = user_id);
  end if;
end
$$;

commit;
