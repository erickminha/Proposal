-- ==========================================
-- SCRIPT DE CONFIGURAÇÃO COMPLETO - SUPABASE
-- ==========================================

BEGIN;

-- 1. Extensões Necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Organizações
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Tabela de Perfis de Usuário (Profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Tabela de Propostas
CREATE TABLE IF NOT EXISTS public.propostas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cliente_nome TEXT,
    proposta_numero TEXT,
    status TEXT NOT NULL DEFAULT 'Rascunho' CHECK (status IN ('Rascunho', 'Pendente', 'Aceita', 'Recusada')),
    dados JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Tabela de Pareceres de Candidatos (Candidate Reports)
CREATE TABLE IF NOT EXISTS public.candidate_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    candidate_name TEXT NOT NULL,
    position_name TEXT NOT NULL,
    company_name TEXT,
    report_data JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'finalizado')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Índices para Performance
CREATE INDEX IF NOT EXISTS idx_propostas_org_id ON public.propostas(organization_id);
CREATE INDEX IF NOT EXISTS idx_candidate_reports_org_id ON public.candidate_reports(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_org_id ON public.profiles(organization_id);

-- 7. Habilitar Row Level Security (RLS)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.propostas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_reports ENABLE ROW LEVEL SECURITY;

-- 8. Políticas de Segurança (RLS)

-- Organizações: Usuários podem ver a organização a que pertencem
CREATE POLICY "Users can view their own organization" ON public.organizations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.organization_id = organizations.id
            AND profiles.id = auth.uid()
        )
    );

-- Profiles: Usuários podem ver e editar seu próprio perfil
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Propostas: Membros da mesma organização podem ver/editar propostas
CREATE POLICY "Members can view organization proposals" ON public.propostas
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.organization_id = propostas.organization_id
            AND profiles.id = auth.uid()
        )
    );

CREATE POLICY "Members can insert organization proposals" ON public.propostas
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.organization_id = propostas.organization_id
            AND profiles.id = auth.uid()
        )
    );

CREATE POLICY "Members can update organization proposals" ON public.propostas
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.organization_id = propostas.organization_id
            AND profiles.id = auth.uid()
        )
    );

CREATE POLICY "Members can delete organization proposals" ON public.propostas
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.organization_id = propostas.organization_id
            AND profiles.id = auth.uid()
        )
    );

-- Candidate Reports: Membros da mesma organização podem ver/editar pareceres
CREATE POLICY "Members can view organization reports" ON public.candidate_reports
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.organization_id = candidate_reports.organization_id
            AND profiles.id = auth.uid()
        )
    );

CREATE POLICY "Members can insert organization reports" ON public.candidate_reports
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.organization_id = candidate_reports.organization_id
            AND profiles.id = auth.uid()
        )
    );

CREATE POLICY "Members can update organization reports" ON public.candidate_reports
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.organization_id = candidate_reports.organization_id
            AND profiles.id = auth.uid()
        )
    );

CREATE POLICY "Members can delete organization reports" ON public.candidate_reports
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.organization_id = candidate_reports.organization_id
            AND profiles.id = auth.uid()
        )
    );

-- 9. Função para Atualizar o timestamp 'updated_at' automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_propostas_updated_at BEFORE UPDATE ON public.propostas FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_candidate_reports_updated_at BEFORE UPDATE ON public.candidate_reports FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

COMMIT;
