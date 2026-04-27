# Usage Guide - Arquitetura Refatorada

Este documento mostra exemplos práticos de como usar os novos hooks, componentes e utilities criados.

## 📚 Índice

- [Custom Hooks](#custom-hooks)
- [Componentes Reutilizáveis](#componentes-reutilizáveis)
- [Service Layer](#service-layer)
- [Validação e Formatação](#validação-e-formatação)
- [AppContext Global](#appcontext-global)

---

## Custom Hooks

### useFormState - Formulário com Auto-save

```javascript
import { useFormState } from '@/hooks/useFormState';
import { supabaseService } from '@/services/supabaseService';

export function ProposalEditor({ proposalId }) {
  const { data, setField, saving, saveMsg, handleSaveManual } = useFormState(
    {
      clienteNome: '',
      value: 1000,
      status: 'Rascunho',
    },
    async (formData) => {
      const result = await supabaseService.proposals.update(proposalId, {
        dados: formData,
        updated_at: new Date().toISOString(),
      });
      
      if (!result.ok) throw new Error(result.error);
    }
  );

  return (
    <>
      <input
        value={data.clienteNome}
        onChange={(e) => setField('clienteNome', e.target.value)}
        placeholder="Nome do cliente"
      />
      
      <button onClick={handleSaveManual} disabled={saving}>
        {saving ? 'Salvando...' : 'Salvar'}
      </button>
      
      {saveMsg && <p>{saveMsg}</p>}
    </>
  );
}
```

### useIsMobile - Responsividade

```javascript
import { useIsMobile } from '@/hooks/useUtilities';

export function Layout({ children }) {
  const isMobile = useIsMobile();

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row' 
    }}>
      {children}
    </div>
  );
}
```

### useCopyToClipboard - Copiar URL

```javascript
import { useCopyToClipboard } from '@/hooks/useUtilities';

export function ShareLink({ url }) {
  const { copy, copied } = useCopyToClipboard();

  return (
    <button onClick={() => copy(url)}>
      {copied ? '✓ Copiado!' : '📋 Copiar Link'}
    </button>
  );
}
```

### useDebounce - Busca com Debounce

```javascript
import { useDebounce } from '@/hooks/useUtilities';
import { useProposalList } from '@/hooks/useDataManagement';

export function ProposalSearch() {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 500);
  const { propostas, setSearchTerm } = useProposalList(orgId);

  useEffect(() => {
    setSearchTerm(debouncedSearch);
  }, [debouncedSearch]);

  return (
    <input
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Buscar propostas..."
    />
  );
}
```

### useAsync - Operação Assíncrona

```javascript
import { useAsync } from '@/hooks/useUtilities';
import { supabaseService } from '@/services/supabaseService';

export function ProposalDetail({ id }) {
  const { execute, status, value, error } = useAsync(
    () => supabaseService.proposals.get(id),
    false
  );

  useEffect(() => {
    execute();
  }, [id]);

  if (status === 'pending') return <LoadingSpinner />;
  if (status === 'error') return <ErrorMessage message={error.message} />;

  return <div>{value?.data?.cliente_nome}</div>;
}
```

### useLocalStorage - Persistência Local

```javascript
import { useLocalStorage } from '@/hooks/useUtilities';

export function UserPreferences() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Tema: {theme}
    </button>
  );
}
```

### useProposalList - Gerenciar Lista de Propostas

```javascript
import { useProposalList } from '@/hooks/useDataManagement';
import { ErrorMessage, EmptyState, ProgressBar } from '@/components/UIComponents';

export function ProposalListView({ organizationId }) {
  const {
    propostas,
    searchTerm,
    setSearchTerm,
    loading,
    error,
    deleteProposal,
    getStatusSummary,
    total,
  } = useProposalList(organizationId);

  if (loading) return <LoadingSpinner message="Carregando propostas..." />;
  if (error) return <ErrorMessage message={error} />;
  if (total === 0) return <EmptyState title="Nenhuma proposta" />;

  const summary = getStatusSummary();

  return (
    <>
      <input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Buscar..."
      />

      <div>
        {propostas.map((p) => (
          <div key={p.id}>
            <h3>{p.dados?.clienteNome}</h3>
            <button onClick={() => deleteProposal(p.id)}>Deletar</button>
          </div>
        ))}
      </div>

      <p>Rascunho: {summary['Rascunho'] || 0}</p>
      <p>Aceita: {summary['Aceita'] || 0}</p>
    </>
  );
}
```

---

## Componentes Reutilizáveis

### LoadingSpinner

```javascript
import { LoadingSpinner } from '@/components/UIComponents';

<LoadingSpinner message="Salvando..." size={32} />
```

### Alertas (Error, Success, Warning)

```javascript
import { 
  ErrorMessage, 
  SuccessMessage, 
  WarningMessage 
} from '@/components/UIComponents';

<ErrorMessage 
  message="Erro ao salvar proposta" 
  onDismiss={() => setError(null)}
/>

<SuccessMessage 
  message="Proposta salva com sucesso!"
  icon="🎉"
/>

<WarningMessage message="Confirme suas alterações antes de continuar" />
```

### EmptyState

```javascript
import { EmptyState } from '@/components/UIComponents';

<EmptyState
  icon="📭"
  title="Nenhuma proposta"
  message="Comece criando sua primeira proposta"
  action={{
    label: "Criar Proposta",
    onClick: () => { /* ... */ }
  }}
/>
```

### ConfirmDialog

```javascript
import { ConfirmDialog } from '@/components/UIComponents';
import { useModal } from '@/hooks/useUtilities';

export function DeleteProposal({ proposalId }) {
  const { isOpen, open, close } = useModal();

  const handleDelete = async () => {
    await supabaseService.proposals.delete(proposalId);
    close();
  };

  return (
    <>
      <button onClick={open}>Deletar</button>

      <ConfirmDialog
        isOpen={isOpen}
        title="Deletar proposta?"
        message="Esta ação não pode ser desfeita"
        onConfirm={handleDelete}
        onCancel={close}
        confirmText="Deletar"
        cancelText="Cancelar"
      />
    </>
  );
}
```

### StatusBadge

```javascript
import { StatusBadge } from '@/components/UIComponents';

<StatusBadge status="Aceita" color="#10b981" size="md" />
<StatusBadge status="Rascunho" size="sm" />
```

### ProgressBar

```javascript
import { ProgressBar } from '@/components/UIComponents';

<ProgressBar percentage={75} color="#3b82f6" />
```

### ErrorBoundary

```javascript
import { ErrorBoundary } from '@/components/UIComponents';

<ErrorBoundary>
  <ProposalEditor />
  <ProposalList />
</ErrorBoundary>
```

---

## Service Layer

### Propostas

```javascript
import { supabaseService } from '@/services/supabaseService';

// Listar
const { ok, data } = await supabaseService.proposals.list(orgId, {
  status: 'Aceita'
});

// Obter
const { ok, data } = await supabaseService.proposals.get(proposalId);

// Criar
const { ok, data } = await supabaseService.proposals.create({
  organization_id: orgId,
  cliente_nome: 'Empresa XYZ',
  dados: { /* ... */ }
});

// Atualizar
const { ok, data } = await supabaseService.proposals.update(id, {
  dados: { /* dados atualizados */ }
});

// Atualizar Status
const { ok } = await supabaseService.proposals.updateStatus(id, 'Aceita');

// Deletar
const { ok } = await supabaseService.proposals.delete(id);
```

### Pareceres de Candidatos

```javascript
// Listar
const { ok, data } = await supabaseService.candidateReports.list(orgId);

// Criar
const { ok, data } = await supabaseService.candidateReports.create({
  organization_id: orgId,
  candidate_name: 'João Silva',
  status: 'finalizado'
});

// Atualizar
const { ok, data } = await supabaseService.candidateReports.update(id, {
  status: 'finalizado'
});

// Deletar
const { ok } = await supabaseService.candidateReports.delete(id);
```

### Organização

```javascript
// Obter
const { ok, data } = await supabaseService.organizations.get(orgId);

// Atualizar
const { ok, data } = await supabaseService.organizations.update(orgId, {
  name: 'Nova Nome da Org'
});
```

### Membros

```javascript
// Convidar
const { ok } = await supabaseService.organizationMembers.invite({
  organization_id: orgId,
  email: 'user@example.com',
  role: 'member'
});

// Mudar role
const { ok } = await supabaseService.organizationMembers.changeRole({
  organization_id: orgId,
  user_id: userId,
  new_role: 'admin'
});

// Remover
const { ok } = await supabaseService.organizationMembers.remove({
  organization_id: orgId,
  user_id: userId
});
```

---

## Validação e Formatação

### Validadores

```javascript
import { validators } from '@/utils/validation';

validators.email('user@example.com')        // true
validators.cnpj('12.345.678/0001-95')       // true/false
validators.phone('(85) 98888-8888')         // true
validators.required('texto')                // true
validators.minLength('abc', 2)              // true
validators.maxLength('abc', 5)              // true
validators.url('https://example.com')       // true
validators.number(123)                      // true
```

### Sanitizadores

```javascript
import { sanitizers } from '@/utils/validation';

sanitizers.cnpj('12345678901234')           // 12.345.678/0001-34
sanitizers.phone('85988888888')             // (85) 98888-8888
sanitizers.text('<h1>Olá</h1>')             // Olá
sanitizers.trim('  texto  ')                // texto
sanitizers.removeAccents('São Paulo')       // Sao Paulo
sanitizers.lowercase('TEXTO')               // texto
sanitizers.uppercase('texto')               // TEXTO
```

### Validar Formulário

```javascript
import { validateForm, validators } from '@/utils/validation';

const schema = {
  email: [validators.email],
  phone: [validators.phone],
  name: [validators.required, (v) => validators.minLength(v, 3)]
};

const { isValid, errors } = validateForm(formData, schema);

if (!isValid) {
  console.log(errors); // { email: ['Email inválido'], ... }
}
```

### Formatadores

```javascript
import {
  formatDate,
  formatCurrency,
  formatPercentage,
  timeAgo,
  truncateText,
  sortBy,
  groupBy,
  removeDuplicates,
  paginate,
  formatFileSize
} from '@/utils/formatters';

formatDate('2026-04-27')                    // 27/04/2026
formatCurrency(1500)                        // R$ 1.500,00
formatPercentage(75.5)                      // 75.5%
timeAgo('2026-04-25')                       // há 2 dia(s)
truncateText('Lorem ipsum dolor sit', 10)   // Lorem ipsu...
sortBy([...], 'name', 'asc')                // Array ordenado
groupBy([...], 'status')                    // Object agrupado
removeDuplicates([1, 2, 2, 3])              // [1, 2, 3]
paginate([...], 10, 1)                      // Primeira página
formatFileSize(1024000)                     // 1000 KB
```

---

## AppContext Global

### Setup no main.jsx

```javascript
import { AppProvider } from '@/contexts/AppContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <AppProvider>
    <App />
  </AppProvider>
);
```

### Usar em Componentes

```javascript
import { useApp } from '@/contexts/AppContext';

export function Header() {
  const { user, organization, addNotification, logout } = useApp();

  const handleLogout = async () => {
    const result = await logout();
    if (result.ok) {
      addNotification('Desconectado!', 'success', 2000);
    }
  };

  return (
    <>
      <p>Olá, {user?.email}</p>
      <p>Organização: {organization?.name}</p>
      <button onClick={handleLogout}>Sair</button>
    </>
  );
}
```

---

## 🎯 Resumo

| Tipo | Localização | Exemplo |
|------|------------|---------|
| **Hooks** | `src/hooks/` | `useFormState`, `useProposalList` |
| **Componentes** | `src/components/` | `LoadingSpinner`, `ErrorMessage` |
| **Context** | `src/contexts/` | `AppProvider`, `useApp` |
| **Services** | `src/services/` | `supabaseService.proposals.list()` |
| **Utils** | `src/utils/` | `validators.email()`, `formatDate()` |

