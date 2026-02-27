# Gerador de Propostas Comerciais 📄

App completo com login, geração e histórico de propostas.

---

## ⚙️ Configuração do Supabase

### 1. Criar projeto no Supabase
Acesse supabase.com → New Project

### 2. Criar a tabela no SQL Editor do Supabase

```sql
create table propostas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  organization_id uuid not null,
  cliente_nome text,
  proposta_numero text,
  data_proposta date,
  dados jsonb not null,
  created_at timestamp with time zone default now()
);

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

alter table propostas
  add constraint propostas_organization_id_proposta_numero_key
  unique (organization_id, proposta_numero);

alter table propostas enable row level security;

create policy "Usuário vê suas propostas"
  on propostas for all
  using (auth.uid() = user_id);
```

### 3. Pegar credenciais
Supabase → Settings → API → copiar Project URL e anon key

### 4. Configurar variáveis de ambiente

Localmente: crie arquivo `.env` na raiz:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxx...
```

No Netlify: Site → Site configuration → Environment variables

---

## Rodar localmente
```bash
npm install
npm run dev
```

## Deploy Netlify
- Build command: npm run build
- Publish directory: dist
