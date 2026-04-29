import pandas as pd
import os
from supabase import create_client, Client
import json

# Configurações do Supabase fornecidas pelo usuário
url = "https://xwftbbeouzfanlfqerlx.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3ZnRiYmVvdXpmYW5sZnFlcmx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIxMTc2MjUsImV4cCI6MjA4NzY5MzYyNX0.b4uYotL2ZBcKd1hfrG87QLeqrCxML4p6O_-HTHfJvfo"
supabase: Client = create_client(url, key)

def import_excel_to_supabase(file_path):
    print(f"Lendo arquivo: {file_path}")
    xls = pd.ExcelFile(file_path)
    
    # 1. Importar Empresas para Organizations
    print("Importando organizações...")
    if 'Empresas' in xls.sheet_names:
        df_empresas = pd.read_excel(xls, 'Empresas')
        for _, row in df_empresas.iterrows():
            org_name = str(row.get('Nome', row.get('Empresa', ''))).strip()
            if not org_name or org_name == 'nan': continue
            
            try:
                res = supabase.table('organizations').select('id').eq('name', org_name).execute()
                if not res.data:
                    print(f"Inserindo organização: {org_name}")
                    supabase.table('organizations').insert({'name': org_name}).execute()
            except Exception as e:
                print(f"Erro ao processar organização {org_name}: {e}")
    
    # Mapeamento de nomes de empresas para IDs
    try:
        orgs = supabase.table('organizations').select('id', 'name').execute()
        org_map = {o['name']: o['id'] for o in orgs.data}
        print(f"Mapeamento de organizações carregado: {len(org_map)} encontradas.")
    except Exception as e:
        print(f"Erro ao carregar organizações: {e}")
        return

    # 2. Tentar obter um user_id válido para as tabelas que exigem
    # Se não houver usuários, o script SQL que criamos pode falhar no insert se a coluna for NOT NULL.
    # Vamos tentar descobrir se existe algum usuário.
    user_id = None
    try:
        # Tentar buscar do profiles se existir
        profiles = supabase.table('profiles').select('id').limit(1).execute()
        if profiles.data:
            user_id = profiles.data[0]['id']
    except:
        pass

    # 3. Importar Pareceres para candidate_reports
    print("Importando pareceres...")
    if 'Parecer' in xls.sheet_names:
        df_parecer = pd.read_excel(xls, 'Parecer')
        df_parecer.columns = [str(c).strip() for c in df_parecer.columns]
        
        reports_to_insert = []
        for _, row in df_parecer.iterrows():
            empresa_nome = str(row.get('Empresa')).strip()
            org_id = org_map.get(empresa_nome)
            
            if not org_id: continue

            report_data = {
                'idade': str(row.get('Idade', '')),
                'estado_civil': str(row.get('Estado civil', '')),
                'formacao': str(row.get('Formação Acadêmica', '')),
                'historico': str(row.get('Breve Histórico Profissional', '')),
                'avaliacao_perfil': str(row.get('Avaliação do Perfil', '')),
                'disc_d': str(row.get('D', '0')),
                'disc_i': str(row.get('I', '0')),
                'disc_s': str(row.get('S', '0')),
                'disc_c': str(row.get('C', '0')),
                'comportamento_esperado': str(row.get('Durante a entrevista', '')),
                'doc_url': str(row.get('Merged Doc URL - parecer', ''))
            }

            report = {
                'organization_id': org_id,
                'candidate_name': str(row.get('NOME COMPLETO:', 'Candidato Sem Nome')),
                'position_name': str(row.get('Cargo', row.get('Vaga', 'Não especificado'))),
                'company_name': empresa_nome,
                'status': 'finalizado' if 'Document successfully merged' in str(row.get('Document Merge Status - parecer', '')) else 'rascunho',
                'report_data': report_data
            }
            
            # Se tivermos um user_id, adicionamos. Se o banco permitir nulo, ok.
            if user_id:
                report['user_id'] = user_id
            
            reports_to_insert.append(report)
            
            if len(reports_to_insert) >= 20:
                try:
                    supabase.table('candidate_reports').insert(reports_to_insert).execute()
                    print(f"Lote de {len(reports_to_insert)} pareceres inserido.")
                except Exception as e:
                    print(f"Erro ao inserir lote: {e}")
                reports_to_insert = []
        
        if reports_to_insert:
            try:
                supabase.table('candidate_reports').insert(reports_to_insert).execute()
                print(f"Último lote de {len(reports_to_insert)} pareceres inserido.")
            except Exception as e:
                print(f"Erro ao inserir último lote: {e}")

    print("Importação concluída!")

if __name__ == "__main__":
    import_excel_to_supabase('/home/ubuntu/upload/GestãodeTrabalho.xlsx')
