-- Organização, membros e auditoria para gestão administrativa.
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'admin', 'member')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists public.organization_invites (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role text not null check (role in ('owner', 'admin', 'member')),
  invited_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'revoked')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, email)
);

create table if not exists public.admin_audit_logs (
  id bigint generated always as identity primary key,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  actor_user_id uuid not null references auth.users(id) on delete cascade,
  target_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.organization_invites enable row level security;
alter table public.admin_audit_logs enable row level security;

create policy if not exists "members can read own organizations"
on public.organization_members
for select
using (auth.uid() = user_id);

create policy if not exists "members can read own invites"
on public.organization_invites
for select
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = organization_invites.organization_id
      and m.user_id = auth.uid()
  )
);

create policy if not exists "members can read audit logs"
on public.admin_audit_logs
for select
using (
  exists (
    select 1 from public.organization_members m
    where m.organization_id = admin_audit_logs.organization_id
      and m.user_id = auth.uid()
  )
);
