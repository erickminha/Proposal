-- Gera número sequencial de proposta por organização (com lock transacional)
-- e garante unicidade por organização.

alter table public.propostas
  add column if not exists organization_id uuid;

update public.propostas
set organization_id = user_id
where organization_id is null;

alter table public.propostas
  alter column organization_id set not null;

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
    and proposta_numero ~ '^\d+/\d{4}$'
    and split_part(proposta_numero, '/', 2) = current_year;

  return format('%s/%s', next_seq, current_year);
end;
$$;

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
