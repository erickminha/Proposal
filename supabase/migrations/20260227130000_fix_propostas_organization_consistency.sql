-- Corrige consistência de propostas.organization_id de forma idempotente.
-- Objetivo:
-- 1) garantir coluna e estrutura mínima;
-- 2) corrigir quaisquer organization_id incorretos em propostas (ex.: preenchidos com user_id);
-- 3) garantir integridade referencial e NOT NULL;
-- 4) garantir índice e unicidade por organização.

begin;

create extension if not exists pgcrypto;

alter table if exists public.propostas
  add column if not exists organization_id uuid;

-- Garante uma organização default para usuários que ainda não têm profile.
with users_without_profile as (
  select u.id as user_id,
         (
           substr(md5('default-org:' || u.id::text), 1, 8) || '-' ||
           substr(md5('default-org:' || u.id::text), 9, 4) || '-' ||
           substr(md5('default-org:' || u.id::text), 13, 4) || '-' ||
           substr(md5('default-org:' || u.id::text), 17, 4) || '-' ||
           substr(md5('default-org:' || u.id::text), 21, 12)
         )::uuid as organization_id
  from auth.users u
  where not exists (
    select 1
    from public.profiles p
    where p.id = u.id
  )
)
insert into public.organizations (id, name)
select uwp.organization_id,
       'Organização padrão - ' || left(uwp.user_id::text, 8)
from users_without_profile uwp
on conflict (id) do nothing;

with users_without_profile as (
  select u.id as user_id,
         (
           substr(md5('default-org:' || u.id::text), 1, 8) || '-' ||
           substr(md5('default-org:' || u.id::text), 9, 4) || '-' ||
           substr(md5('default-org:' || u.id::text), 13, 4) || '-' ||
           substr(md5('default-org:' || u.id::text), 17, 4) || '-' ||
           substr(md5('default-org:' || u.id::text), 21, 12)
         )::uuid as organization_id
  from auth.users u
  where not exists (
    select 1
    from public.profiles p
    where p.id = u.id
  )
)
insert into public.profiles (id, organization_id, role)
select uwp.user_id,
       uwp.organization_id,
       'owner'
from users_without_profile uwp
where not exists (
  select 1
  from public.profiles p
  where p.id = uwp.user_id
);

-- Corrige propostas.organization_id com base no vínculo canônico (profiles).
-- Isso corrige inclusive casos antigos em que organization_id foi preenchido como user_id.
-- Também evita colisões de (organization_id, proposta_numero) durante o backfill,
-- reenumerando apenas os duplicados que surgirem após a consolidação por organização.
update public.propostas pr
set organization_id = pf.organization_id
from public.profiles pf
where pf.id = pr.user_id
  and (
    pr.organization_id is null
    or pr.organization_id is distinct from pf.organization_id
    or not exists (
      select 1
      from public.organizations o
      where o.id = pr.organization_id
    )
  );

with colliding_rows as (
  select pr.id,
         pr.organization_id,
         pr.proposta_numero,
         coalesce(nullif(split_part(pr.proposta_numero, '/', 2), ''), extract(year from coalesce(pr.created_at, now()))::text) as proposal_year,
         row_number() over (
           partition by pr.organization_id, pr.proposta_numero
           order by pr.created_at nulls last, pr.id
         ) as duplicate_rank
  from public.propostas pr
),
rows_to_renumber as (
  select c.id,
         c.organization_id,
         c.proposal_year,
         row_number() over (
           partition by c.organization_id, c.proposal_year
           order by pr.created_at nulls last, pr.id
         ) as seq_offset
  from colliding_rows c
  join public.propostas pr on pr.id = c.id
  where c.duplicate_rank > 1
),
base_numbers as (
  select pr.organization_id,
         split_part(pr.proposta_numero, '/', 2) as proposal_year,
         max(split_part(pr.proposta_numero, '/', 1)::integer) as max_seq
  from public.propostas pr
  where pr.proposta_numero ~ '^[0-9]+/[0-9]{4}$'
  group by pr.organization_id, split_part(pr.proposta_numero, '/', 2)
),
renumbered as (
  select r.id,
         format('%s/%s', coalesce(b.max_seq, 0) + r.seq_offset, r.proposal_year) as new_proposta_numero
  from rows_to_renumber r
  left join base_numbers b
    on b.organization_id = r.organization_id
   and b.proposal_year = r.proposal_year
)
update public.propostas pr
set proposta_numero = rn.new_proposta_numero
from renumbered rn
where pr.id = rn.id;

-- Valida consistência antes de aplicar constraints rígidas.
do $$
declare
  v_null_org_in_propostas bigint;
  v_invalid_org_fk bigint;
  v_invalid_profile_org bigint;
begin
  select count(*)
    into v_null_org_in_propostas
  from public.propostas
  where organization_id is null;

  if v_null_org_in_propostas > 0 then
    raise exception
      'Validação falhou: % registros em propostas.organization_id ainda estão NULL.',
      v_null_org_in_propostas;
  end if;

  select count(*)
    into v_invalid_org_fk
  from public.propostas pr
  left join public.organizations o on o.id = pr.organization_id
  where o.id is null;

  if v_invalid_org_fk > 0 then
    raise exception
      'Validação falhou: % propostas com organization_id sem organização válida.',
      v_invalid_org_fk;
  end if;

  select count(*)
    into v_invalid_profile_org
  from public.profiles p
  left join public.organizations o on o.id = p.organization_id
  where p.organization_id is null
     or o.id is null;

  if v_invalid_profile_org > 0 then
    raise exception
      'Validação falhou: % profiles com organization_id nulo/inválido.',
      v_invalid_profile_org;
  end if;
end
$$;

alter table public.propostas
  alter column organization_id set not null;

-- Garante FK idempotente.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'propostas_organization_id_fkey'
      and conrelid = 'public.propostas'::regclass
  ) then
    alter table public.propostas
      add constraint propostas_organization_id_fkey
      foreign key (organization_id)
      references public.organizations(id)
      on delete restrict;
  end if;
end
$$;

create index if not exists propostas_organization_id_created_at_idx
  on public.propostas (organization_id, created_at desc);

-- Função de numeração sequencial por organização/ano.
create or replace function public.next_proposal_number(org_id uuid)
returns text
language plpgsql
as $$
declare
  next_seq integer;
  current_year text := extract(year from now())::text;
begin
  perform pg_advisory_xact_lock(hashtext('propostas:' || org_id::text));

  select coalesce(max(split_part(proposta_numero, '/', 1)::integer), 0) + 1
    into next_seq
  from public.propostas
  where organization_id = org_id
    and proposta_numero ~ '^[0-9]+/[0-9]{4}$'
    and split_part(proposta_numero, '/', 2) = current_year;

  return format('%s/%s', next_seq, current_year);
end;
$$;

-- Unicidade por organização.
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'propostas_organization_id_proposta_numero_key'
      and conrelid = 'public.propostas'::regclass
  ) then
    alter table public.propostas
      add constraint propostas_organization_id_proposta_numero_key
      unique (organization_id, proposta_numero);
  end if;
end;
$$;

commit;
