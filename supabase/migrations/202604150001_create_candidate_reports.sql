begin;

create table if not exists public.candidate_reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete restrict,
  user_id uuid not null references auth.users(id) on delete restrict,
  candidate_name text not null,
  position_name text not null,
  company_name text,
  report_data jsonb not null,
  status text not null default 'rascunho' check (status in ('rascunho', 'finalizado')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists candidate_reports_org_created_at_idx
  on public.candidate_reports (organization_id, created_at desc);

create index if not exists candidate_reports_candidate_name_idx
  on public.candidate_reports (organization_id, candidate_name);

create index if not exists candidate_reports_position_name_idx
  on public.candidate_reports (organization_id, position_name);

alter table public.candidate_reports enable row level security;

do $$
declare
  p record;
begin
  for p in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'candidate_reports'
  loop
    execute format('drop policy if exists %I on public.candidate_reports', p.policyname);
  end loop;

  create policy candidate_reports_select_org
    on public.candidate_reports
    for select
    to authenticated
    using (
      exists (
        select 1
        from public.profiles pr
        where pr.id = auth.uid()
          and pr.organization_id = candidate_reports.organization_id
      )
    );

  create policy candidate_reports_insert_org
    on public.candidate_reports
    for insert
    to authenticated
    with check (
      auth.uid() = user_id
      and exists (
        select 1
        from public.profiles pr
        where pr.id = auth.uid()
          and pr.organization_id = candidate_reports.organization_id
      )
    );

  create policy candidate_reports_update_org
    on public.candidate_reports
    for update
    to authenticated
    using (
      exists (
        select 1
        from public.profiles pr
        where pr.id = auth.uid()
          and pr.organization_id = candidate_reports.organization_id
      )
    )
    with check (
      exists (
        select 1
        from public.profiles pr
        where pr.id = auth.uid()
          and pr.organization_id = candidate_reports.organization_id
      )
    );

  create policy candidate_reports_delete_org
    on public.candidate_reports
    for delete
    to authenticated
    using (
      exists (
        select 1
        from public.profiles pr
        where pr.id = auth.uid()
          and pr.organization_id = candidate_reports.organization_id
      )
    );
end
$$;

commit;
