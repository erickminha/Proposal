# RGA RH - SaaS de Recrutamento e Seleção 👥

Plataforma completa para gestão de processos seletivos, propostas comerciais de RH e banco de talentos.

---

## 🚀 Novidades: Pivot para RH
O software evoluiu de um simples gerador de propostas para um **SaaS de RH focado em Recrutamento e Seleção**.
- **Módulo de Propostas:** Templates específicos para serviços de RH.
- **Banco de Talentos:** Página pública para recebimento de currículos.
- **Gestão de Candidatos:** Painel interno para triagem e acompanhamento.
- **Gerador de Anúncios:** Criação de artes para vagas (JPG/PDF).

---

## ⚙️ Configuração do Supabase

### 1. Criar projeto no Supabase
Acesse [supabase.com](https://supabase.com) → New Project

### 2. Configurar o Banco de Dados
Execute os scripts SQL localizados na pasta `supabase/migrations` e o arquivo `supabase_schema.sql` na raiz para configurar todas as tabelas necessárias:
- `organizations` e `profiles` (Onboarding)
- `propostas` (Comercial)
- `candidate_reports` (Pareceres Técnicos)
- `candidaturas` (Banco de Currículos)

### 3. Configurar Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxx...
```

---

## 🛠️ Deploy na Vercel

Para evitar problemas de "Tela Branca" e garantir o funcionamento das rotas (SPA):
1. Certifique-se de que as variáveis de ambiente acima estão configuradas no painel da Vercel.
2. O arquivo `vercel.json` já está configurado para lidar com o roteamento do React Router.

---

## 💻 Desenvolvimento Local
```bash
npm install
npm run dev
```

## 📄 Licença
Privado - Instituto RGA
