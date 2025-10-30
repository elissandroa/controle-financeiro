# Controle de Acesso - RBAC (Role-Based Access Control)

## Visão Geral

O sistema implementa controle de acesso baseado em roles (RBAC) usando JWT tokens que contêm as permissões do usuário.

## 🔐 Roles Disponíveis

### ROLE_ADMIN
- Acesso completo ao sistema
- Pode gerenciar usuários (CRUD)
- Pode visualizar e gerenciar todas as seções
- **Aba "Usuários" visível no Dashboard**

### ROLE_USER
- Acesso às funcionalidades principais
- Dashboard, Transações, Membros, Relatórios
- **Não pode acessar gerenciamento de usuários**

## 📋 Implementação Técnica

### Estrutura do JWT Token

O JWT token retornado pela API contém as seguintes informações no payload:

```json
{
  "sub": "username",
  "authorities": [
    "ROLE_ADMIN",
    "ROLE_USER"
  ],
  "exp": 1698765432,
  "iat": 1698679032
}
```

**Campos:**
- `sub`: Username do usuário
- `authorities`: Array de strings com as roles/permissões
- `exp`: Timestamp de expiração do token
- `iat`: Timestamp de quando o token foi emitido

### Funções de Controle de Acesso

**Arquivo:** `/components/auth-service.ts`

#### `decodeJWT(token: string): DecodedToken | null`
Decodifica o JWT token para extrair o payload.
```typescript
const decoded = decodeJWT(token);
// { sub: "admin", authorities: ["ROLE_ADMIN"], exp: ..., iat: ... }
```

#### `getUserAuthorities(): string[]`
Retorna as roles do usuário atual.
```typescript
const roles = getUserAuthorities();
// ["ROLE_ADMIN", "ROLE_USER"]
```

#### `hasRole(role: string): boolean`
Verifica se o usuário tem uma role específica.
```typescript
if (hasRole('ROLE_ADMIN')) {
  // Usuário é admin
}
```

#### `isAdmin(): boolean`
Verifica se o usuário tem ROLE_ADMIN.
```typescript
if (isAdmin()) {
  // Mostrar funcionalidades administrativas
}
```

#### `getCurrentUsername(): string | null`
Retorna o username do usuário atual.
```typescript
const username = getCurrentUsername();
// "admin"
```

## 🛡️ Proteções Implementadas

### 1. Nível de UI (Dashboard.tsx)

**Aba Condicional:**
```typescript
const userIsAdmin = isAdmin();

// Ajusta o grid dinamicamente
<TabsList className={`grid w-full ${userIsAdmin ? 'grid-cols-5' : 'grid-cols-4'}`}>
  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
  <TabsTrigger value="transactions">Transações</TabsTrigger>
  <TabsTrigger value="members">Membros</TabsTrigger>
  {userIsAdmin && <TabsTrigger value="users">Usuários</TabsTrigger>}
  <TabsTrigger value="reports">Relatórios</TabsTrigger>
</TabsList>

// Conteúdo condicional
{userIsAdmin && (
  <TabsContent value="users">
    <UsersManagement />
  </TabsContent>
)}
```

**Resultado:**
- Usuários não-admin **não veem a aba "Usuários"**
- O grid se ajusta de 5 para 4 colunas automaticamente

### 2. Nível de Componente (UsersManagement.tsx)

**Verificação Interna:**
```typescript
export default function UsersManagement() {
  if (!isAdmin()) {
    return (
      <Card>
        <CardContent>
          <AlertTriangle />
          <h3>Acesso Restrito</h3>
          <p>Apenas administradores podem acessar o gerenciamento de usuários.</p>
        </CardContent>
      </Card>
    );
  }
  
  // Resto do componente...
}
```

**Resultado:**
- Mesmo que alguém tente acessar diretamente, verá mensagem de acesso negado
- Camada extra de segurança no frontend

### 3. Nível de API (Servidor)

A API Spring Boot também valida as permissões no backend usando:
- Spring Security
- Anotações `@PreAuthorize` ou `@Secured`
- Validação do JWT

## 🔄 Fluxo de Autenticação e Autorização

```
1. Login
   ↓
2. API retorna JWT com authorities
   ↓
3. Token armazenado em sessionStorage
   ↓
4. Token decodificado no cliente
   ↓
5. Roles extraídas do token
   ↓
6. UI ajustada baseado nas roles
   ↓
7. Requisições incluem token no header
   ↓
8. API valida token e permissions
```

## 🧪 Testando o Controle de Acesso

### Como Administrador (ROLE_ADMIN)

1. Faça login com um usuário que tenha ROLE_ADMIN
2. Veja que a aba "Usuários" está visível no menu
3. Acesse e gerencie usuários normalmente
4. Dashboard mostra 5 abas: Dashboard | Transações | Membros | **Usuários** | Relatórios

**Teste no Console do Navegador (F12):**
```javascript
// Importar funções (se necessário)
import { isAdmin, getUserAuthorities } from './components/auth-service';

// Verificar se é admin
console.log('É admin?', isAdmin()); // true

// Ver todas as roles
console.log('Roles:', getUserAuthorities()); // ["ROLE_ADMIN", ...]
```

### Como Usuário Regular (ROLE_USER)

1. Faça login com um usuário que tenha apenas ROLE_USER
2. A aba "Usuários" **não aparecerá** no menu
3. Tentativa de acesso direto mostrará mensagem de "Acesso Restrito"
4. Dashboard mostra 4 abas: Dashboard | Transações | Membros | Relatórios

**Teste no Console do Navegador (F12):**
```javascript
console.log('É admin?', isAdmin()); // false
console.log('Roles:', getUserAuthorities()); // ["ROLE_USER"]
```

### Criando Usuários de Teste

**Via API (com Postman ou curl):**

**Usuário Admin:**
```bash
POST http://localhost:8080/users
Authorization: Bearer {token_de_admin}
Content-Type: application/json

{
  "firstName": "Admin",
  "lastName": "Teste",
  "email": "admin@teste.com",
  "Password": "admin123",
  "roles": [
    { "id": 1 }  // ID da ROLE_ADMIN
  ]
}
```

**Usuário Regular:**
```bash
POST http://localhost:8080/users
Authorization: Bearer {token_de_admin}
Content-Type: application/json

{
  "firstName": "Usuario",
  "lastName": "Regular",
  "email": "user@teste.com",
  "Password": "user123",
  "roles": [
    { "id": 2 }  // ID da ROLE_USER
  ]
}
```

### Verificando JWT Token

**No Console do Navegador (F12):**
```javascript
// Ver o token armazenado
const token = sessionStorage.getItem('auth_token');
console.log('Token JWT:', token);

// Decodificar manualmente
const parts = token.split('.');
const payload = JSON.parse(atob(parts[1]));
console.log('Payload do JWT:', payload);
// { sub: "admin", authorities: ["ROLE_ADMIN"], exp: ..., iat: ... }
```

## 🔧 Extensibilidade

Para adicionar novas proteções baseadas em roles:

### Exemplo 1: Ocultar Botão de Delete
```typescript
import { isAdmin } from './auth-service';

// No componente
const userIsAdmin = isAdmin();

<Button 
  onClick={handleDelete} 
  disabled={!userIsAdmin}
  className={!userIsAdmin ? 'hidden' : ''}
>
  Deletar
</Button>
```

### Exemplo 2: Verificar Role Específica
```typescript
import { hasRole } from './auth-service';

if (hasRole('ROLE_FINANCIAL_MANAGER')) {
  // Mostrar relatórios financeiros avançados
}
```

### Exemplo 3: Verificar Múltiplas Roles
```typescript
import { getUserAuthorities } from './auth-service';

const authorities = getUserAuthorities();
const canEditBudget = authorities.includes('ROLE_ADMIN') || 
                      authorities.includes('ROLE_FINANCIAL_MANAGER');
```

## ⚠️ Notas de Segurança

1. **Segurança do Frontend é Cosmética**: O controle de acesso no frontend serve apenas para melhorar a UX. A **verdadeira segurança** está no backend.

2. **Validação no Backend**: A API Spring Boot **sempre valida** as permissões antes de executar operações.

3. **Token Expiration**: O token expira após 86400 segundos (24 horas). Após isso, o usuário precisa fazer login novamente.

4. **Sem Validação de Assinatura no Frontend**: O frontend apenas **lê** o payload do JWT. Não valida a assinatura - isso é responsabilidade do servidor.

## 📚 Referências

- **auth-service.ts**: Funções de autenticação e autorização
- **Dashboard.tsx**: Implementação de UI condicional
- **UsersManagement.tsx**: Proteção de componente
- **AUTH_INTEGRATION.md**: Documentação de autenticação OAuth2
- **API_INTEGRATION.md**: Documentação da API
