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
