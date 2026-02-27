-- Migração idempotente para garantir organização/perfil e preencher propostas.organization_id.
-- Ordem obrigatória:
-- 1) criar organização default por usuário sem perfil
-- 2) criar perfil owner por usuário sem perfil
-- 3) preencher propostas.organization_id
-- 4) validar consistência
-- 5) somente então aplicar NOT NULL

begin;

create extension if not exists pgcrypto;

alter table if exists public.propostas
  add column if not exists organization_id uuid;

-- Garante a FK (idempotente).
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

-- 1) Cria uma organização default determinística por usuário sem perfil.
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
    where p.user_id = u.id
  )
)
insert into public.organizations (id, name)
select uwp.organization_id,
       'Organização padrão - ' || left(uwp.user_id::text, 8)
from users_without_profile uwp
on conflict (id) do nothing;

-- 2) Cria perfil owner para todo usuário sem perfil.
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
    where p.user_id = u.id
  )
)
insert into public.profiles (user_id, organization_id, role)
select uwp.user_id,
       uwp.organization_id,
       'owner'
from users_without_profile uwp
where not exists (
  select 1
  from public.profiles p
  where p.user_id = uwp.user_id
);

-- 3) Backfill de propostas.organization_id a partir de propostas.user_id -> profiles.
update public.propostas pr
set organization_id = pf.organization_id
from public.profiles pf
where pf.user_id = pr.user_id
  and pr.organization_id is null;

-- 4) Validações pós-migração (abortam a transação se houver inconsistência).
do $$
declare
  v_null_org_in_propostas bigint;
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

-- 5) Somente após validações, torna a coluna obrigatória.
alter table public.propostas
  alter column organization_id set not null;

commit;
