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
  cliente_nome text,
  proposta_numero text,
  data_proposta date,
  dados jsonb not null,
  created_at timestamp with time zone default now()
);

alter table propostas enable row level security;

create policy "Usuário vê suas propostas"
  on propostas for all
  using (auth.uid() = user_id);
```


### 2.1. Configurar onboarding transacional (organizations + profiles)
Execute também o SQL de `supabase/migrations/20260227100000_onboarding.sql`.
Ele cria as tabelas `organizations` e `profiles` (se ainda não existirem) e a função RPC segura `complete_onboarding`, que faz o vínculo de forma idempotente sem risco de inconsistência parcial.

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

## Gestão de membros por Edge Functions

Foram adicionadas três Edge Functions para administração de membros de organizações:

- `invite_member`
- `change_member_role`
- `remove_member`

### Regras de segurança implementadas

- validação de `auth.uid()` em todas as funções;
- validação de associação à organização alvo (`organization_id`);
- permissão restrita para papéis `owner`/`admin`;
- bloqueio para remoção do último `owner`;
- bloqueio de auto-downgrade inválido de `owner`;
- gravação de logs de auditoria em `admin_audit_logs`.

### Frontend

O frontend agora expõe helpers que usam `supabase.functions.invoke` em `src/supabase.js`:

- `inviteMember(payload)`
- `changeMemberRole(payload)`
- `removeMember(payload)`

### SQL

Use o arquivo `supabase_schema.sql` para criar as tabelas de organização, convites e auditoria.
