# Contingência / rollback (produção)

## Pré-migração (obrigatório)
1. Execute backup lógico das tabelas afetadas:
   - `public.organizations`
   - `public.profiles`
   - `public.propostas`
2. Agende janela curta de manutenção, pois a mudança finaliza com `NOT NULL`.
3. Execute a migration em transação única (já está no arquivo SQL).

## Comportamento de segurança da migration
- Se alguma validação falhar, a migration dispara `RAISE EXCEPTION` e faz `ROLLBACK` automático da transação.
- Isso impede aplicar `NOT NULL` com dados inconsistentes.

## Rollback manual pós-commit (se necessário)
> Use apenas se a migration já tiver sido aplicada e for preciso reverter rapidamente.

```sql
begin;

-- 1) remover restrição NOT NULL para restaurar escrita emergencial
alter table public.propostas
  alter column organization_id drop not null;

-- 2) (opcional) remover FK criada pela migration
alter table public.propostas
  drop constraint if exists propostas_organization_id_fkey;

-- 3) (opcional) limpar organization_id preenchido automaticamente
update public.propostas
set organization_id = null
where organization_id is not null;

commit;
```

## Estratégia recomendada de recuperação completa
1. Restaurar backup das 3 tabelas em ambiente de staging.
2. Validar integridade funcional.
3. Restaurar backup em produção conforme playbook interno.
