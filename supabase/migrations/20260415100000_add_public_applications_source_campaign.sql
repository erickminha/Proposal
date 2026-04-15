create table if not exists public.candidaturas_publicas (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid references public.propostas(id) on delete set null,
  nome text not null,
  email text not null,
  telefone text,
  curriculo_url text not null,
  mensagem text,
  source_campaign text not null default 'direct',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_candidaturas_publicas_proposal_id
  on public.candidaturas_publicas (proposal_id);

create index if not exists idx_candidaturas_publicas_source_campaign
  on public.candidaturas_publicas (source_campaign);

alter table public.candidaturas_publicas enable row level security;

drop policy if exists "Inserção pública de candidaturas" on public.candidaturas_publicas;
create policy "Inserção pública de candidaturas"
  on public.candidaturas_publicas
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Membros da organização podem visualizar candidaturas" on public.candidaturas_publicas;
create policy "Membros da organização podem visualizar candidaturas"
  on public.candidaturas_publicas
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.propostas p
      join public.profiles pf on pf.organization_id = p.organization_id
      where p.id = candidaturas_publicas.proposal_id
        and pf.id = auth.uid()
    )
  );
