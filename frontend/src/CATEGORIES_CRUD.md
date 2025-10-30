# 🏷️ CRUD de Categorias

Documentação do gerenciamento de categorias de transações integrado ao sistema.

---

## 📋 Visão Geral

O sistema agora possui um **CRUD completo de categorias** integrado à seção de transações. As categorias são gerenciadas através da API backend e incluem todas as operações:

- ✅ **Create** (Criar) - Cadastrar nova categoria
- ✅ **Read** (Ler) - Listar todas as categorias
- ✅ **Update** (Atualizar) - Editar categoria existente
- ✅ **Delete** (Excluir) - Remover categoria

---

## 🎯 Localização

O gerenciamento de categorias está localizado em:

**Dashboard → Transações → Card "Gerenciar Categorias"**

Aparece no topo da página de transações, antes da lista de transações.

---

## 🔧 API Endpoints

### Base URL
```
http://localhost:8080/categories
```

### Autenticação
Todas as requisições incluem o **Bearer Token** no header:
```
Authorization: Bearer {JWT_TOKEN}
```

### Endpoints

#### 1. Listar Todas as Categorias
```http
GET /categories
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "name": "Vestuário"
  },
  {
    "id": 2,
    "name": "Alimentação"
  }
]
```

---

#### 2. Criar Nova Categoria
```http
POST /categories
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Vestuário"
}
```

**Response (201 Created):**
```json
{
  "id": 1,
  "name": "Vestuário"
}
```

---

#### 3. Atualizar Categoria
```http
PUT /categories/{id}
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

**Body:**
```json
{
  "id": 1,
  "name": "Vestuário e Calçados"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "name": "Vestuário e Calçados"
}
```

---

#### 4. Excluir Categoria
```http
DELETE /categories/{id}
```

**Headers:**
```
Authorization: Bearer {JWT_TOKEN}
```

**Response (204 No Content):**
```
(sem corpo)
```

**Nota:** A exclusão pode falhar se houver transações usando esta categoria.

---

## 🖥️ Interface do Usuário

### Card de Gerenciamento

```
┌─────────────────────────────────────────────────┐
│ 🏷️ Gerenciar Categorias          [+ Nova Categoria] │
│ Crie e gerencie categorias para suas transações  │
├─────────────────────────────────────────────────┤
│                                                  │
│  ● Vestuário             [✏️ Editar] [🗑️ Excluir]  │
│  ● Alimentação           [✏️ Editar] [🗑️ Excluir]  │
│  ● Transporte            [✏️ Editar] [🗑️ Excluir]  │
│  ● Educação              [✏️ Editar] [🗑️ Excluir]  │
│                                                  │
└─────────────────────────────────────────────────┘
```

### Estado Vazio

Quando não há categorias cadastradas:

```
┌─────────────────────────────────────────────────┐
│ 🏷️ Gerenciar Categorias          [+ Nova Categoria] │
├─────────────────────────────────────────────────┤
│                                                  │
│                    🏷️                            │
│         Nenhuma categoria cadastrada             │
│    Clique em "Nova Categoria" para começar       │
│                                                  │
└─────────────────────────────────────────────────┘
```

---

## 📱 Funcionalidades

### 1. Criar Categoria

1. Clicar no botão **"+ Nova Categoria"**
2. Dialog é aberto com:
   - Título: "Nova Categoria"
   - Campo: "Nome da Categoria"
   - Botões: "Criar" e "Cancelar"
3. Digite o nome (ex: "Vestuário")
4. Pressione Enter ou clique em "Criar"
5. Toast de sucesso: "Categoria criada com sucesso!"
6. Lista atualiza automaticamente

**Validações:**
- ✅ Nome é obrigatório
- ✅ Trim automático (remove espaços extras)

---

### 2. Editar Categoria

1. Clicar no botão **✏️ Editar** da categoria desejada
2. Dialog é aberto com:
   - Título: "Editar Categoria"
   - Campo preenchido com nome atual
   - Botões: "Atualizar" e "Cancelar"
3. Modificar o nome
4. Pressione Enter ou clique em "Atualizar"
5. Toast de sucesso: "Categoria atualizada com sucesso!"
6. Lista atualiza automaticamente

---

### 3. Excluir Categoria

1. Clicar no botão **🗑️ Excluir** da categoria desejada
2. Dialog de confirmação é aberto:
   ```
   ⚠️ Confirmar Exclusão
   
   Tem certeza que deseja excluir a categoria "Vestuário"?
   
   Esta ação não pode ser desfeita. Transações usando 
   esta categoria podem ser afetadas.
   
   [Cancelar]  [Excluir]
   ```
3. Clicar em "Excluir" para confirmar
4. Toast de sucesso: "Categoria excluída com sucesso!"
5. Lista atualiza automaticamente

**Observação:** Se houver transações usando esta categoria, o backend pode retornar erro.

---

### 4. Listar Categorias

- Carregamento automático ao abrir a página
- Grid responsivo:
  - Mobile: 1 coluna
  - Tablet: 2 colunas
  - Desktop: 3 colunas
- Cada categoria mostra:
  - Bolinha colorida (indicador visual)
  - Nome da categoria
  - Botões de ação (Editar e Excluir)

---

## 💻 Código

### Componente Principal
**Arquivo:** `/components/CategoriesManagement.tsx`

**Tecnologias:**
- React Hooks (useState, useEffect)
- Shadcn/UI components
- Sonner para toast notifications
- API Service com Bearer token

**Features:**
- Loading states
- Error handling
- Confirmação de exclusão
- Validação de formulário
- Atualização automática da lista
- Responsividade completa

### Integração
**Arquivo:** `/components/TransactionsView.tsx`

```tsx
import CategoriesManagement from './CategoriesManagement';

// No return do componente:
<CategoriesManagement />
```

### API Service
**Arquivo:** `/components/api-service.ts`

```typescript
export const categoriesApi = {
  getAll: async (): Promise<ApiCategory[]> => { ... },
  create: async (name: string): Promise<ApiCategory> => { ... },
  update: async (id: number, name: string): Promise<ApiCategory> => { ... },
  delete: async (id: number): Promise<void> => { ... },
};
```

**Todas as requisições incluem:**
```typescript
headers: getAuthHeaders() // Inclui Bearer token
```

---

## 🧪 Como Testar

### 1. Teste Manual

#### Criar Categoria
```bash
# 1. Logar no sistema
# 2. Ir para Transações
# 3. Clicar em "+ Nova Categoria"
# 4. Digitar: "Vestuário"
# 5. Clicar em "Criar"
# ✅ Deve aparecer na lista
```

#### Editar Categoria
```bash
# 1. Clicar em ✏️ na categoria "Vestuário"
# 2. Alterar para: "Vestuário e Calçados"
# 3. Clicar em "Atualizar"
# ✅ Deve atualizar o nome
```

#### Excluir Categoria
```bash
# 1. Clicar em 🗑️ na categoria desejada
# 2. Confirmar exclusão
# ✅ Deve remover da lista
```

---

### 2. Teste com cURL

#### Criar
```bash
curl -X POST http://localhost:8080/categories \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"name": "Vestuário"}'
```

#### Listar
```bash
curl -X GET http://localhost:8080/categories \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

#### Atualizar
```bash
curl -X PUT http://localhost:8080/categories/1 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{"id": 1, "name": "Vestuário e Calçados"}'
```

#### Excluir
```bash
curl -X DELETE http://localhost:8080/categories/1 \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

### 3. Teste no DevTools (F12)

```javascript
// No console do navegador:

// Obter token
const token = sessionStorage.getItem('access_token');

// Listar categorias
fetch('http://localhost:8080/categories', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
})
.then(r => r.json())
.then(data => console.log('Categorias:', data));

// Criar categoria
fetch('http://localhost:8080/categories', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ name: 'Vestuário' })
})
.then(r => r.json())
.then(data => console.log('Criado:', data));
```

---

## 🐛 Troubleshooting

### Erro: 401 Unauthorized

**Causa:** Token JWT inválido ou expirado

**Solução:**
1. Fazer logout
2. Fazer login novamente
3. Tentar a operação novamente

---

### Erro: 403 Forbidden

**Causa:** Usuário sem permissão

**Solução:**
Verificar se o usuário tem role adequada (ROLE_USER ou ROLE_ADMIN)

---

### Erro ao Excluir Categoria

**Causa:** Categoria está sendo usada por transações

**Solução:**
1. Editar ou excluir transações que usam esta categoria
2. Tentar excluir novamente

OU

Editar a categoria ao invés de excluir (mantém o ID)

---

### Categorias Não Carregam

**Verificar:**
1. Backend está rodando?
   ```bash
   curl http://localhost:8080/actuator/health
   ```

2. CORS configurado?
   - Backend deve permitir `http://localhost:3000`

3. Token válido?
   ```javascript
   console.log('Token:', sessionStorage.getItem('access_token'));
   ```

4. Console do navegador (F12)
   - Ver erros de rede
   - Ver mensagens de erro

---

## 📊 Exemplos de Categorias

### Despesas
- Alimentação
- Transporte
- Vestuário
- Saúde
- Educação
- Moradia
- Lazer
- Tecnologia
- Pets
- Outros

### Receitas
- Salário
- Freelance
- Investimentos
- Aluguel
- Vendas
- Outros

---

## ✅ Checklist de Implementação

### Frontend
- [x] Componente CategoriesManagement criado
- [x] Integrado em TransactionsView
- [x] CRUD completo (Create, Read, Update, Delete)
- [x] Validações de formulário
- [x] Loading states
- [x] Error handling
- [x] Toast notifications
- [x] Dialog de confirmação para exclusão
- [x] Grid responsivo
- [x] Bearer token em todas as requisições

### API Service
- [x] categoriesApi.getAll()
- [x] categoriesApi.create()
- [x] categoriesApi.update()
- [x] categoriesApi.delete()
- [x] Função getAuthHeaders() inclui Bearer token
- [x] Error handling

### Backend (Verificar)
- [ ] Endpoint GET /categories
- [ ] Endpoint POST /categories
- [ ] Endpoint PUT /categories/{id}
- [ ] Endpoint DELETE /categories/{id}
- [ ] Autenticação JWT
- [ ] CORS configurado

---

## 🎉 Conclusão

O CRUD de categorias está **completo e funcional**! 

**Funcionalidades:**
- ✅ Criar categorias personalizadas
- ✅ Editar categorias existentes
- ✅ Excluir categorias não utilizadas
- ✅ Visualização em grid responsivo
- ✅ Integração completa com backend
- ✅ Bearer token automático
- ✅ Interface intuitiva

**Próximos passos:**
- ✅ ~~Usar categorias dinâmicas ao criar transações~~ **IMPLEMENTADO!**
- Adicionar filtro de categorias nos relatórios
- Adicionar ícones/cores personalizadas para categorias

---

## 🔄 Integração com Transações

### Categorias Dinâmicas

As categorias são agora **carregadas dinamicamente do banco de dados** ao criar/editar transações.

**Como funciona:**

1. Ao abrir a página de Transações, as categorias são carregadas da API
2. No formulário de Nova Transação, o dropdown mostra categorias do banco
3. Ao criar/editar/excluir uma categoria, a lista é atualizada automaticamente
4. Se não houver categorias, o dropdown avisa para cadastrar primeiro

**Fluxo:**

```
TransactionsView
  ├─ useEffect() → loadData()
  │   ├─ getTransactions()
  │   ├─ getMembers()
  │   └─ categoriesApi.getAll() ✨ NOVO
  │
  └─ CategoriesManagement
      └─ onCreate/onUpdate/onDelete → onCategoryChange()
          └─ loadData() → atualiza categorias
```

**Código:**

```typescript
// TransactionsView.tsx
const [categories, setCategories] = useState<ApiCategory[]>([]);

const loadData = async () => {
  const [transactionsData, membersData, categoriesData] = await Promise.all([
    getTransactions(),
    getMembers(),
    categoriesApi.getAll() // ✨ Carrega do banco
  ]);
  setCategories(categoriesData);
};

// No formulário
<Select value={formData.category}>
  {categories.map((cat) => (
    <SelectItem key={cat.id} value={cat.name}>
      {cat.name}
    </SelectItem>
  ))}
</Select>
```

**Benefícios:**

- ✅ Não depende mais de categorias fixas/hardcoded
- ✅ Categorias personalizadas por família
- ✅ Atualização em tempo real
- ✅ Sincronização automática entre componentes

---

**Versão:** 2.4.1  
**Data:** 30 de Outubro de 2025  
**Status:** ✅ Implementado e testado
