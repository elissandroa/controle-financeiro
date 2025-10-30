# Integração com API Spring Boot

## Visão Geral

O aplicativo de controle financeiro familiar está integrado com uma API REST Java Spring Boot rodando em `http://localhost:8080`.

**⚠️ IMPORTANTE**: O aplicativo funciona **APENAS** com a API online. Não há armazenamento local de dados.

## Estrutura de Arquivos

### Arquivos Principais

1. **`/components/auth-service.ts`** - Gerencia autenticação OAuth2 e tokens JWT
2. **`/components/api-service.ts`** - Faz as chamadas HTTP diretas para a API
3. **`/components/api-helpers.ts`** - Camada de abstração que converte tipos e simplifica chamadas

## Autenticação

### OAuth2 Password Grant

Todas as requisições são autenticadas usando OAuth2 com tokens JWT.

**Endpoint de Login:**
```
POST http://localhost:8080/oauth2/token
Content-Type: application/x-www-form-urlencoded
Authorization: Basic base64(myclientid:myclientsecret)

grant_type=password
username={username}
password={password}
```

**IMPORTANTE:** O `client_id` e `client_secret` vão APENAS no header `Authorization: Basic`, não no body!

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "refresh_token": "optional_refresh_token"
}
```

### Headers Automáticos

Todas as requisições incluem automaticamente:
```javascript
{
  "Authorization": "Bearer {token}",
  "Content-Type": "application/json"
}
```

## Endpoints Utilizados

### Categories

#### Listar Categorias
```
GET /categories
Authorization: Bearer {token}
```

**Resposta:**
```json
[
  {
    "id": 1,
    "name": "Alimentação"
  },
  {
    "id": 2,
    "name": "Transporte"
  }
]
```

#### Criar Categoria
```
POST /categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Nova Categoria"
}
```

#### Atualizar Categoria
```
PUT /categories/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "id": 1,
  "name": "Categoria Atualizada"
}
```

#### Deletar Categoria
```
DELETE /categories/{id}
Authorization: Bearer {token}
```

### Members

#### Listar Membros
```
GET /members
Authorization: Bearer {token}
```

**Resposta:**
```json
[
  {
    "id": 1,
    "name": "João Silva",
    "role": "Pai"
  },
  {
    "id": 2,
    "name": "Maria Silva",
    "role": "Mãe"
  }
]
```

#### Criar Membro
```
POST /members
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "João Silva",
  "role": "Pai"
}
```

#### Atualizar Membro
```
PUT /members/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "João Silva",
  "role": "Pai"
}
```

#### Deletar Membro
```
DELETE /members/{id}
Authorization: Bearer {token}
```

### Transactions

#### Listar Transações
```
GET /transactions?page=0&size=100&sort=date,desc&sort=id,desc
Authorization: Bearer {token}
```

**Resposta (Paginada):**
```json
{
  "content": [
    {
      "id": 1,
      "amount": 250.75,
      "description": "Compras do mês",
      "date": "2024-01-15",
      "transactionType": "EXPENSE",
      "memberId": 1,
      "member": {
        "id": 1,
        "name": "João Silva",
        "role": "Pai"
      },
      "category": {
        "id": 1,
        "name": "Alimentação"
      }
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 100
  },
  "totalElements": 50,
  "totalPages": 1,
  "last": true,
  "first": true
}
```

#### Buscar Transação por ID
```
GET /transactions/{id}
Authorization: Bearer {token}
```

#### Criar Transação
```
POST /transactions
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 250.75,
  "description": "Compras do mês",
  "date": "2024-01-15",
  "transactionType": "EXPENSE",
  "memberId": 1,
  "category": {
    "id": 1
  }
}
```

#### Atualizar Transação
```
PUT /transactions/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "id": 1,
  "amount": 250.75,
  "description": "Compras do mês",
  "date": "2024-01-15",
  "transactionType": "EXPENSE",
  "memberId": 1,
  "category": {
    "id": 1
  }
}
```

#### Deletar Transação
```
DELETE /transactions/{id}
Authorization: Bearer {token}
```

### Users

#### Listar Usuários
```
GET /users
Authorization: Bearer {token}
```

**Resposta (Paginada):**
```json
{
  "content": [
    {
      "id": 1,
      "firstName": "Elissandro",
      "lastName": "Aparecido Anastacio",
      "email": "elissandro@gmail.com",
      "phone": "41-995628454",
      "roles": [
        {
          "id": 1,
          "authority": "ROLE_USER"
        },
        {
          "id": 2,
          "authority": "ROLE_ADMIN"
        }
      ]
    }
  ],
  "pageable": {
    "pageNumber": 0,
    "pageSize": 20,
    "sort": {
      "empty": true,
      "unsorted": true,
      "sorted": false
    },
    "offset": 0,
    "unpaged": false,
    "paged": true
  },
  "totalPages": 1,
  "totalElements": 1,
  "last": true,
  "size": 20,
  "number": 0,
  "sort": {
    "empty": true,
    "unsorted": true,
    "sorted": false
  },
  "first": true,
  "numberOfElements": 1,
  "empty": false
}
```

#### Buscar Usuário por ID
```
GET /users/{id}
Authorization: Bearer {token}
```

#### Criar Usuário
```
POST /users
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "João",
  "lastName": "Silva",
  "email": "joao@example.com",
  "phone": "41-999999999",
  "Password": "senha123",
  "roles": [
    { "id": 1 }
  ]
}
```

**Notas:**
- A API usa `Password` com P maiúsculo no campo de senha
- O campo `phone` é opcional

#### Atualizar Usuário
```
PUT /users/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "id": 1,
  "firstName": "João",
  "lastName": "Silva",
  "email": "joao@example.com",
  "phone": "41-999999999",
  "Password": "novaSenha123",
  "roles": [
    { "id": 1 }
  ]
}
```

**Notas:**
- O campo `Password` é **opcional** no update. **Não envie o campo** se não quiser alterar a senha
- Se enviar `Password: null` ou `Password: ""`, a API retornará erro
- O campo `phone` é opcional. Não envie se estiver vazio
- O frontend automaticamente remove campos vazios antes de enviar

**⚠️ Importante:**
```javascript
// ✅ CORRETO - Update sem alterar senha
{
  "id": 1,
  "firstName": "João",
  "lastName": "Silva",
  "email": "joao@example.com",
  "roles": [{ "id": 1 }]
  // Password não incluído
}

// ❌ ERRADO - Gera erro "rawPassword cannot be null"
{
  "id": 1,
  "firstName": "João",
  "lastName": "Silva",
  "email": "joao@example.com",
  "Password": null,  // Não envie!
  "roles": [{ "id": 1 }]
}
```

#### Deletar Usuário
```
DELETE /users/{id}
Authorization: Bearer {token}
```

### Roles

#### Listar Roles
```
GET /roles
Authorization: Bearer {token}
```

**Resposta:**
```json
[
  {
    "id": 1,
    "authority": "ROLE_ADMIN"
  },
  {
    "id": 2,
    "authority": "ROLE_USER"
  }
]
```

## Mapeamento de Dados

### TransactionType

**API → Frontend:**
- `INCOME` → `'income'` (Receita)
- `EXPENSE` → `'expense'` (Despesa)

**Frontend → API:**
- `'income'` → `'INCOME'`
- `'expense'` → `'EXPENSE'`

### Conversão de Tipos

#### Transaction

**API:**
```typescript
interface ApiTransaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  transactionType: 'INCOME' | 'EXPENSE';
  memberId: number;
  member?: {
    id: number;
    name: string;
    role: string;
  };
  category: {
    id: number;
    name?: string;
  };
}
```

**Frontend:**
```typescript
interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  memberId: string;
  memberName?: string;
}
```

#### Member

**API:**
```typescript
interface ApiMember {
  id: number;
  name: string;
  role: string;
}
```

**Frontend:**
```typescript
interface Member {
  id: string;
  name: string;
  role: string;
}
```

## Uso no Código

### Importação

```typescript
// Para operações diretas com a API
import { transactionsApi, membersApi, categoriesApi } from './api-service';

// Para operações simplificadas (recomendado)
import {
  Transaction,
  Member,
  getTransactions,
  getMembers,
  saveTransaction,
  updateTransaction,
  deleteTransaction,
  saveMember,
  updateMember,
  deleteMember,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES
} from './api-helpers';
```

### Exemplos

#### Buscar Transações
```typescript
const transactions = await getTransactions();
console.log(transactions); // Array de Transaction[]
```

#### Criar Transação
```typescript
const newTransaction = await saveTransaction({
  amount: 100.00,
  description: 'Salário',
  date: '2024-01-15',
  type: 'income',
  category: 'Salário',
  memberId: '1'
});
```

#### Atualizar Transação
```typescript
await updateTransaction('1', {
  amount: 150.00,
  description: 'Salário atualizado',
  date: '2024-01-15',
  type: 'income',
  category: 'Salário',
  memberId: '1'
});
```

#### Deletar Transação
```typescript
await deleteTransaction('1');
```

#### Gerenciar Membros
```typescript
// Listar
const members = await getMembers();

// Criar
const newMember = await saveMember({
  name: 'João Silva',
  role: 'Pai'
});

// Atualizar
await updateMember('1', {
  name: 'João Silva Jr.',
  role: 'Filho'
});

// Deletar
await deleteMember('1');
```

## Tratamento de Erros

### Erros Comuns

#### 401 Unauthorized
**Causa**: Token expirado ou inválido
**Solução**: Usuário é redirecionado automaticamente para o login

#### 404 Not Found
**Causa**: Recurso não encontrado
**Solução**: Mensagem de erro via toast

#### 500 Internal Server Error
**Causa**: Erro no servidor
**Solução**: Mensagem de erro via toast

### Exemplo de Tratamento

```typescript
try {
  const transactions = await getTransactions();
  // Processar transações
} catch (error) {
  console.error('Erro ao buscar transações:', error);
  toast.error('Erro ao carregar transações');
}
```

## Paginação

A API de transações retorna dados paginados. O `api-service.ts` automaticamente busca todas as páginas:

```typescript
export const transactionsApi = {
  getAll: async (): Promise<ApiTransaction[]> => {
    let allTransactions: ApiTransaction[] = [];
    let currentPage = 0;
    let hasMore = true;
    
    while (hasMore) {
      const response = await fetch(
        `${API_BASE_URL}/transactions?page=${currentPage}&size=100&sort=date,desc&sort=id,desc`,
        { headers: getAuthHeaders() }
      );
      const pagedData = await handleResponse<PagedResponse<ApiTransaction>>(response);
      
      allTransactions = [...allTransactions, ...pagedData.content];
      hasMore = !pagedData.last;
      currentPage++;
    }
    
    return allTransactions;
  }
};
```

## Ordenação

As transações são ordenadas por:
1. Data (mais recentes primeiro)
2. ID (maiores primeiro)

```
sort=date,desc&sort=id,desc
```

## Configuração CORS

O backend Spring Boot deve ter CORS configurado para aceitar requisições do frontend:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173") // Vite dev server
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

## Checklist de Integração

### Backend (Spring Boot)
- [ ] API rodando em `http://localhost:8080`
- [ ] Endpoints REST implementados
- [ ] OAuth2 configurado com password grant
- [ ] CORS configurado para `http://localhost:5173`
- [ ] JWT configurado (duração 86400s = 24h)
- [ ] Client ID: `myclientid`
- [ ] Client Secret: `myclientsecret`

### Frontend (React)
- [ ] `auth-service.ts` configurado
- [ ] `api-service.ts` com endpoints corretos
- [ ] `api-helpers.ts` para conversão de tipos
- [ ] Login screen funcionando
- [ ] Tokens armazenados em sessionStorage
- [ ] Headers de autorização em todas as requisições

## Troubleshooting

### Erro: "Failed to fetch"
**Causas:**
- Backend não está rodando
- CORS não configurado
- Firewall bloqueando

**Soluções:**
- Verificar se backend está em `http://localhost:8080`
- Configurar CORS no Spring Boot
- Desabilitar firewall/antivírus temporariamente

### Erro: 401 Unauthorized
**Causas:**
- Token expirado
- Token inválido
- Credenciais incorretas

**Soluções:**
- Fazer login novamente
- Verificar configurações OAuth2 no backend
- Verificar client_id e client_secret

### Erro: 404 Not Found
**Causas:**
- Endpoint não existe no backend
- URL incorreta

**Soluções:**
- Verificar implementação dos endpoints no backend
- Verificar URL base em `api-service.ts`

## Dependências

### Frontend
- React 18+
- TypeScript
- Fetch API (nativo)

### Backend
- Spring Boot 2.x ou 3.x
- Spring Security OAuth2
- Spring Data JPA
- Banco de dados (PostgreSQL/MySQL/H2)

## Performance

### Otimizações Implementadas

- ✅ Paginação automática (100 itens por página)
- ✅ Cache de token em memória
- ✅ Conversão de tipos lazy
- ✅ Requisições paralelas com Promise.all

### Recomendações

- 📊 Implementar cache de dados no frontend
- 🔄 Implementar refresh token automático
- ⚡ Usar React Query para gerenciamento de estado
- 📱 Implementar service worker para offline

## Monitoramento

### Logs

O sistema registra logs detalhados no console:

```
🔐 [Auth] Iniciando login...
✅ [Auth] Login realizado com sucesso
📊 [Dashboard] Carregando dados...
📊 [Dashboard] Dados carregados: { transactions: 50, members: 4 }
```

### DevTools

Use o DevTools do navegador para:
- **Network**: Verificar requisições HTTP
- **Console**: Ver logs da aplicação
- **Application > Session Storage**: Ver tokens armazenados

## Segurança

### Implementado
- ✅ OAuth2 com JWT
- ✅ HTTPS recomendado em produção
- ✅ SessionStorage (tokens limpos ao fechar navegador)
- ✅ Verificação de expiração de token
- ✅ Authorization header em todas as requisições

### Recomendações
- 🔒 Usar HTTPS em produção
- 🔑 Implementar refresh token
- 🚫 Configurar rate limiting no backend
- 🛡️ Implementar CSP (Content Security Policy)
- 📝 Logging de auditoria no backend

## Contato e Suporte

Para problemas de integração:
1. Verifique os logs do console
2. Verifique os logs do backend Spring Boot
3. Teste os endpoints com Postman/curl
4. Consulte a documentação do Spring Security OAuth2
