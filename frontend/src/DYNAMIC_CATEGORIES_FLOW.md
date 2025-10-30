# 🔄 Fluxo de Categorias Dinâmicas

Documentação do sistema de categorias dinâmicas integrado entre CategoriesManagement e TransactionsView.

---

## 📊 Visão Geral

O sistema agora carrega categorias **dinamicamente do banco de dados** ao invés de usar categorias fixas no código.

**Componentes integrados:**
- `CategoriesManagement` - Gerencia CRUD de categorias
- `TransactionsView` - Usa categorias ao criar transações
- `categoriesApi` - Interface com a API backend

---

## 🔄 Fluxo de Dados

### 1. Inicialização

```
┌─────────────────────────────────────────────────────────┐
│  TransactionsView carrega                               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  useEffect() → loadData()                               │
│      ├─ getTransactions()      → transactions[]         │
│      ├─ getMembers()           → members[]              │
│      └─ categoriesApi.getAll() → categories[] ✨        │
│                                                          │
│  Estado:                                                 │
│  {                                                       │
│    transactions: [...],                                  │
│    members: [...],                                       │
│    categories: [                                         │
│      { id: 1, name: "Alimentação" },                     │
│      { id: 2, name: "Transporte" },                      │
│      { id: 3, name: "Vestuário" }                        │
│    ]                                                     │
│  }                                                       │
└─────────────────────────────────────────────────────────┘
```

---

### 2. Criar Nova Categoria

```
┌────────────────────────────────────────────────────────────────┐
│  USUÁRIO                                                        │
│  Clica em "+ Nova Categoria"                                   │
│  Digite: "Educação"                                            │
│  Clica em "Criar"                                              │
└────────────────────────────────────────────────────────────────┘
                             ↓
┌────────────────────────────────────────────────────────────────┐
│  CategoriesManagement.handleSubmit()                           │
│                                                                 │
│  1. categoriesApi.create("Educação")                           │
│     POST http://localhost:8080/categories                      │
│     Headers: { Authorization: Bearer TOKEN }                   │
│     Body: { "name": "Educação" }                               │
│     → Response: { "id": 4, "name": "Educação" }                │
│                                                                 │
│  2. toast.success("Categoria criada com sucesso!")             │
│                                                                 │
│  3. loadCategories() → atualiza lista local                    │
│                                                                 │
│  4. onCategoryChange() → NOTIFICA TRANSACTIONSVIEW ✨          │
└────────────────────────────────────────────────────────────────┘
                             ↓
┌────────────────────────────────────────────────────────────────┐
│  TransactionsView.loadData()                                   │
│                                                                 │
│  Recarrega todas as categorias:                                │
│  categoriesApi.getAll()                                        │
│  GET http://localhost:8080/categories                          │
│  → Response: [                                                 │
│      { id: 1, name: "Alimentação" },                           │
│      { id: 2, name: "Transporte" },                            │
│      { id: 3, name: "Vestuário" },                             │
│      { id: 4, name: "Educação" } ← NOVA!                       │
│    ]                                                            │
│                                                                 │
│  setCategories([...]) → ATUALIZA ESTADO                        │
└────────────────────────────────────────────────────────────────┘
                             ↓
┌────────────────────────────────────────────────────────────────┐
│  SELECT DE CATEGORIAS ATUALIZA AUTOMATICAMENTE                 │
│                                                                 │
│  <Select>                                                       │
│    <SelectItem value="Alimentação">Alimentação</SelectItem>    │
│    <SelectItem value="Transporte">Transporte</SelectItem>      │
│    <SelectItem value="Vestuário">Vestuário</SelectItem>        │
│    <SelectItem value="Educação">Educação</SelectItem> ← NOVO!  │
│  </Select>                                                      │
└────────────────────────────────────────────────────────────────┘
```

---

### 3. Criar Transação com Categoria Dinâmica

```
┌────────────────────────────────────────────────────────────────┐
│  USUÁRIO                                                        │
│  Clica em "Nova Transação"                                     │
│  Seleciona categoria: "Educação" ← Do banco de dados!          │
│  Preenche outros campos                                        │
│  Clica em "Adicionar"                                          │
└────────────────────────────────────────────────────────────────┘
                             ↓
┌────────────────────────────────────────────────────────────────┐
│  TransactionsView.handleSubmit()                               │
│                                                                 │
│  formData = {                                                   │
│    category: "Educação",  ← Nome da categoria                  │
│    amount: 500,                                                 │
│    description: "Livros",                                       │
│    ...                                                          │
│  }                                                              │
│                                                                 │
│  saveTransaction(formData)                                     │
│  → API salva com o nome da categoria                           │
└────────────────────────────────────────────────────────────────┘
```

---

### 4. Editar/Excluir Categoria

```
┌────────────────────────────────────────────────────────────────┐
│  EDITAR CATEGORIA                                               │
│                                                                 │
│  1. Usuário clica em ✏️ "Educação"                              │
│  2. Altera para "Educação e Cursos"                            │
│  3. Clica em "Atualizar"                                       │
│                                                                 │
│  CategoriesManagement:                                         │
│  └─ categoriesApi.update(4, "Educação e Cursos")               │
│     └─ onCategoryChange() → TransactionsView.loadData()        │
│        └─ Select atualiza: "Educação e Cursos" ✨              │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│  EXCLUIR CATEGORIA                                              │
│                                                                 │
│  1. Usuário clica em 🗑️ "Educação e Cursos"                     │
│  2. Confirma exclusão                                          │
│                                                                 │
│  CategoriesManagement:                                         │
│  └─ categoriesApi.delete(4)                                    │
│     └─ onCategoryChange() → TransactionsView.loadData()        │
│        └─ Select remove opção "Educação e Cursos" ✨           │
└────────────────────────────────────────────────────────────────┘
```

---

## 💻 Implementação Técnica

### TransactionsView.tsx

```typescript
import { categoriesApi, ApiCategory } from './api-service';

export default function TransactionsView() {
  // State para categorias dinâmicas
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  
  // Carrega categorias do banco
  const loadData = async () => {
    const [transactionsData, membersData, categoriesData] = await Promise.all([
      getTransactions(),
      getMembers(),
      categoriesApi.getAll() // ✨ API call
    ]);
    
    setTransactions(transactionsData);
    setMembers(membersData);
    setCategories(categoriesData); // ✨ Atualiza estado
  };
  
  return (
    <div>
      {/* Gerenciamento de Categorias */}
      <CategoriesManagement 
        onCategoryChange={loadData} // ✨ Callback para recarregar
      />
      
      {/* Formulário de Transação */}
      <Select value={formData.category}>
        {categories.length === 0 ? (
          <div>Nenhuma categoria cadastrada</div>
        ) : (
          categories.map((cat) => (
            <SelectItem key={cat.id} value={cat.name}>
              {cat.name}
            </SelectItem>
          ))
        )}
      </Select>
    </div>
  );
}
```

---

### CategoriesManagement.tsx

```typescript
interface CategoriesManagementProps {
  onCategoryChange?: () => void; // ✨ Callback opcional
}

export default function CategoriesManagement({ 
  onCategoryChange 
}: CategoriesManagementProps) {
  
  const handleSubmit = async () => {
    // Criar ou atualizar categoria
    if (editingCategory) {
      await categoriesApi.update(editingCategory.id, categoryName);
    } else {
      await categoriesApi.create(categoryName);
    }
    
    await loadCategories(); // Atualiza lista local
    
    // ✨ Notifica componente pai
    if (onCategoryChange) {
      onCategoryChange();
    }
  };
  
  const handleDeleteConfirm = async () => {
    await categoriesApi.delete(deletingCategory.id);
    await loadCategories();
    
    // ✨ Notifica componente pai
    if (onCategoryChange) {
      onCategoryChange();
    }
  };
}
```

---

### api-service.ts

```typescript
export const categoriesApi = {
  // Lista todas as categorias
  getAll: async (): Promise<ApiCategory[]> => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      headers: getAuthHeaders(), // Bearer token automático
    });
    return handleResponse<ApiCategory[]>(response);
  },
  
  // Cria nova categoria
  create: async (name: string): Promise<ApiCategory> => {
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name }),
    });
    return handleResponse<ApiCategory>(response);
  },
  
  // Atualiza categoria existente
  update: async (id: number, name: string): Promise<ApiCategory> => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ id, name }),
    });
    return handleResponse<ApiCategory>(response);
  },
  
  // Exclui categoria
  delete: async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<void>(response);
  },
};
```

---

## 🎯 Casos de Uso

### Caso 1: Primeiro Acesso (Sem Categorias)

```
1. Usuário acessa Transações
2. loadData() retorna categories = []
3. Select mostra: "Nenhuma categoria cadastrada"
4. Usuário cria categoria "Alimentação"
5. onCategoryChange() recarrega
6. Select mostra: "Alimentação"
```

---

### Caso 2: Adicionar Múltiplas Categorias

```
1. Usuário cria "Transporte"
   → Select: [Alimentação, Transporte]
   
2. Usuário cria "Vestuário"
   → Select: [Alimentação, Transporte, Vestuário]
   
3. Usuário cria "Saúde"
   → Select: [Alimentação, Transporte, Vestuário, Saúde]

Cada criação atualiza o Select automaticamente ✨
```

---

### Caso 3: Renomear Categoria

```
1. Categoria existente: "Transporte"
2. Usuário edita para "Transporte e Combustível"
3. onCategoryChange() recarrega
4. Select atualiza o nome
5. Transações antigas mantêm o nome antigo (se armazenado)
```

---

### Caso 4: Excluir Categoria em Uso

```
1. Categoria "Saúde" usada em 5 transações
2. Usuário tenta excluir
3. Backend retorna erro (constraint)
4. Toast: "Erro ao excluir categoria. Ela pode estar em uso."
5. Categoria permanece no Select
```

---

## ✅ Validações

### Frontend

```typescript
// No Select de categorias
{categories.length === 0 ? (
  <div className="px-2 py-6 text-center">
    Nenhuma categoria cadastrada.
    <br />
    Cadastre uma categoria primeiro.
  </div>
) : (
  categories.map((cat) => ...)
)}
```

### Backend

- Nome obrigatório
- Nome único (opcional)
- Não pode excluir se em uso (foreign key constraint)

---

## 🔐 Segurança

**Todas as requisições incluem Bearer token:**

```typescript
headers: getAuthHeaders()
// Retorna:
{
  'Authorization': 'Bearer eyJhbGciOiJIUzI1...',
  'Content-Type': 'application/json'
}
```

**Verificações:**
- Token JWT validado no backend
- Expiração: 86400 segundos (24h)
- Renovação: fazer login novamente

---

## 📱 UX/UI

### Feedback Visual

```
Criar categoria:
  ✅ Toast: "Categoria criada com sucesso!"
  ✅ Select atualiza instantaneamente
  ✅ Dialog fecha automaticamente

Editar categoria:
  ✅ Toast: "Categoria atualizada com sucesso!"
  ✅ Nome atualiza na lista
  ✅ Select reflete mudança

Excluir categoria:
  ✅ Dialog de confirmação
  ✅ Toast: "Categoria excluída com sucesso!"
  ✅ Select remove opção
```

### Loading States

```typescript
const [isLoading, setIsLoading] = useState(false);

// Durante operação
setIsLoading(true);
await categoriesApi.create(...);
setIsLoading(false);

// UI desabilita botões
<Button disabled={isLoading}>
  {isLoading ? 'Salvando...' : 'Criar'}
</Button>
```

---

## 🐛 Troubleshooting

### Categorias Não Aparecem no Select

**Verificar:**

1. Console do navegador (F12):
   ```javascript
   // Ver estado
   console.log('Categories:', categories);
   
   // Deve mostrar: [{ id: 1, name: "..." }, ...]
   ```

2. Network tab (F12):
   ```
   GET http://localhost:8080/categories
   Status: 200 OK
   Response: [...]
   ```

3. Backend rodando:
   ```bash
   curl http://localhost:8080/categories \
     -H "Authorization: Bearer TOKEN"
   ```

---

### Select Não Atualiza Após Criar Categoria

**Possíveis causas:**

1. **onCategoryChange não está sendo passado:**
   ```tsx
   // ❌ Errado
   <CategoriesManagement />
   
   // ✅ Correto
   <CategoriesManagement onCategoryChange={loadData} />
   ```

2. **onCategoryChange não é chamado:**
   ```typescript
   // Verificar em CategoriesManagement.tsx
   if (onCategoryChange) {
     onCategoryChange(); // ✅ Deve estar aqui
   }
   ```

3. **loadData() não atualiza state:**
   ```typescript
   // Verificar
   setCategories(categoriesData); // ✅ Deve estar aqui
   ```

---

### Erro 401 ao Carregar Categorias

**Causa:** Token inválido ou expirado

**Solução:**
```
1. Fazer logout
2. Fazer login novamente
3. Tentar carregar categorias
```

---

## 📊 Comparação: Antes vs Depois

### ANTES (Categorias Fixas)

```typescript
// api-helpers.ts
export const EXPENSE_CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Vestuário',
  // ... fixo no código
];

// TransactionsView.tsx
const categories = transactionType === 'expense' 
  ? EXPENSE_CATEGORIES 
  : INCOME_CATEGORIES;

// ❌ Problemas:
// - Não personalizável
// - Hardcoded
// - Igual para todas as famílias
// - Difícil de manter
```

### DEPOIS (Categorias Dinâmicas)

```typescript
// TransactionsView.tsx
const [categories, setCategories] = useState<ApiCategory[]>([]);

const loadData = async () => {
  const categoriesData = await categoriesApi.getAll();
  setCategories(categoriesData);
};

// ✅ Benefícios:
// - Personalizável por família
// - Carregado do banco
// - CRUD completo
// - Atualização em tempo real
// - Sincronização automática
```

---

## 🎉 Benefícios do Sistema

### Para o Usuário

- ✅ Categorias personalizadas
- ✅ Criar quantas categorias quiser
- ✅ Editar nomes quando necessário
- ✅ Excluir categorias não utilizadas
- ✅ Atualização instantânea
- ✅ Interface intuitiva

### Para o Desenvolvedor

- ✅ Código desacoplado
- ✅ Fácil manutenção
- ✅ Reutilizável
- ✅ Testável
- ✅ Escalável
- ✅ Documentado

### Para o Sistema

- ✅ Dados persistidos
- ✅ Sincronização em tempo real
- ✅ Consistência de dados
- ✅ Performance otimizada (cache)
- ✅ Segurança (JWT)

---

## 📝 Resumo

**Fluxo completo em 4 passos:**

```
1. loadData() → categoriesApi.getAll() → setCategories()
2. Usuário gerencia categorias no CategoriesManagement
3. onCreate/onUpdate/onDelete → onCategoryChange()
4. TransactionsView.loadData() → Select atualiza
```

**Arquivos envolvidos:**
- `/components/TransactionsView.tsx` - Consome categorias
- `/components/CategoriesManagement.tsx` - Gerencia categorias
- `/components/api-service.ts` - Interface com API

**API Endpoints:**
- `GET /categories` - Lista todas
- `POST /categories` - Cria nova
- `PUT /categories/{id}` - Atualiza
- `DELETE /categories/{id}` - Exclui

**Resultado:**
Sistema totalmente dinâmico, personalizável e sincronizado! 🎉

---

**Versão:** 2.5.1  
**Data:** 30 de Outubro de 2025  
**Status:** ✅ Implementado e testado
