alter table public.propostas
  add column if not exists organization_id uuid;

update public.propostas p
set organization_id = coalesce(
  (u.raw_app_meta_data ->> 'organization_id')::uuid,
  (u.raw_user_meta_data ->> 'organization_id')::uuid
)
from auth.users u
where p.user_id = u.id
  and p.organization_id is null;

do $$
begin
  if exists (select 1 from public.propostas where organization_id is null) then
    raise exception 'Existem propostas sem organization_id após backfill. Corrija os dados antes de aplicar NOT NULL.';
  end if;
end
$$;

alter table public.propostas
  alter column organization_id set not null;

create index if not exists propostas_organization_id_created_at_idx
  on public.propostas (organization_id, created_at desc);
