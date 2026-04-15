begin;

create extension if not exists pgcrypto;

create table if not exists public.candidate_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null,
  phone text,
  city text,
  state text,
  position_interest text,
  linkedin_url text,
  resume_file_path text not null,
  source text not null default 'public_site',
  consent_lgpd boolean not null,
  created_at timestamptz not null default now(),
  status text not null default 'novo'
);

alter table public.candidate_applications enable row level security;

-- Nenhum acesso de leitura pública; apenas membros internos autenticados.
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'candidate_applications'
      and policyname = 'Membros internos autenticados podem ler candidaturas'
  ) then
    create policy "Membros internos autenticados podem ler candidaturas"
      on public.candidate_applications
      for select
      to authenticated
      using (
        exists (
          select 1
          from public.organization_members om
          where om.user_id = auth.uid()
        )
      );
  end if;
end
$$;

-- Bloqueia inserção direta por papéis de aplicação.
revoke insert on table public.candidate_applications from anon, authenticated;

-- Função segura para inserção pública via RPC.
create or replace function public.submit_candidate_application(
  p_full_name text,
  p_email text,
  p_phone text default null,
  p_city text default null,
  p_state text default null,
  p_position_interest text default null,
  p_linkedin_url text default null,
  p_resume_file_path text default null,
  p_source text default 'public_site',
  p_consent_lgpd boolean default false,
  p_status text default 'novo'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  if coalesce(nullif(trim(p_full_name), ''), '') = '' then
    raise exception 'full_name é obrigatório';
  end if;

  if coalesce(nullif(trim(p_email), ''), '') = '' then
    raise exception 'email é obrigatório';
  end if;

  if coalesce(nullif(trim(p_resume_file_path), ''), '') = '' then
    raise exception 'resume_file_path é obrigatório';
  end if;

  if p_consent_lgpd is distinct from true then
    raise exception 'consent_lgpd deve ser true';
  end if;

  insert into public.candidate_applications (
    full_name,
    email,
    phone,
    city,
    state,
    position_interest,
    linkedin_url,
    resume_file_path,
    source,
    consent_lgpd,
    status
  )
  values (
    trim(p_full_name),
    lower(trim(p_email)),
    nullif(trim(p_phone), ''),
    nullif(trim(p_city), ''),
    nullif(trim(p_state), ''),
    nullif(trim(p_position_interest), ''),
    nullif(trim(p_linkedin_url), ''),
    trim(p_resume_file_path),
    coalesce(nullif(trim(p_source), ''), 'public_site'),
    p_consent_lgpd,
    coalesce(nullif(trim(p_status), ''), 'novo')
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.submit_candidate_application(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  boolean,
  text
) from public;

grant execute on function public.submit_candidate_application(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  boolean,
  text
) to anon, authenticated;

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do update
set public = excluded.public;

-- Upload/leitura restritos a membros internos autenticados.
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Membros internos podem enviar currículos'
  ) then
    create policy "Membros internos podem enviar currículos"
      on storage.objects
      for insert
      to authenticated
      with check (
        bucket_id = 'resumes'
        and exists (
          select 1
          from public.organization_members om
          where om.user_id = auth.uid()
        )
      );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Membros internos podem ler currículos'
  ) then
    create policy "Membros internos podem ler currículos"
      on storage.objects
      for select
      to authenticated
      using (
        bucket_id = 'resumes'
        and exists (
          select 1
          from public.organization_members om
          where om.user_id = auth.uid()
        )
      );
  end if;
end
$$;

commit;
