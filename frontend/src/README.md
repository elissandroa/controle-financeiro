# 💰 Controle Financeiro Familiar

Sistema completo de gerenciamento financeiro familiar com autenticação OAuth2, controle de acesso baseado em roles (RBAC) e integração com API Spring Boot.

## 🚀 Recursos Principais

### 📊 Dashboard
- Visão geral das finanças familiares
- Resumo de receitas e despesas mensais
- Balanço individual por membro
- Opção de ocultar valores por privacidade

### 💸 Transações
- Cadastro completo de receitas e despesas
- Categorização de transações
- Atribuição por membro da família
- Histórico completo com busca e filtros
- Ordenação por data (mais recentes primeiro)

### 👥 Membros
- Gerenciamento de membros da família
- Definição de roles (Pai, Mãe, Filho, etc.)
- Visualização de transações por membro

### 📈 Relatórios
- Gráficos de receitas vs despesas
- Análise por categoria
- Desempenho individual por membro
- Filtros por período (3, 6, 12 meses ou tudo)
- Projeções financeiras

### 👤 Usuários (Admin)
- **🔒 Acesso restrito a ROLE_ADMIN**
- CRUD completo de usuários
- Gerenciamento de roles/permissões
- Atribuição de múltiplas roles
- Criação de novos administradores

## 🔐 Segurança e Autenticação

### OAuth2 + JWT
- Autenticação via Spring Boot OAuth2
- Token JWT com duração de 24 horas
- Client credentials: `myclientid` / `myclientsecret`
- Armazenamento seguro em sessionStorage

### Recuperação de Senha
- Fluxo completo de reset via email
- Link único com token UUID
- Tela dedicada para nova senha
- Validação de força da senha
- **Token validado apenas no backend** (segurança)
- **Endpoints**: `/auth/recover-token`, `/auth/new-password`

### Controle de Acesso (RBAC)
- **ROLE_ADMIN**: Acesso completo, incluindo gerenciamento de usuários
- **ROLE_USER**: Acesso às funcionalidades principais
- Decodificação de JWT para extrair roles
- UI condicional baseada em permissões

**📖 Documentação Completa:**

**Deploy & Produção:**
- ⚡ [DEPLOY_QUICK_START.md](./DEPLOY_QUICK_START.md) - **Deploy em 5 minutos**
- 📦 [DEPLOYMENT.md](./DEPLOYMENT.md) - **Deploy completo no GitHub Pages**
- 🗄️ [BACKEND_DEPLOYMENT.md](./BACKEND_DEPLOYMENT.md) - **Deploy do backend**
- 🌐 [CUSTOM_DOMAIN.md](./CUSTOM_DOMAIN.md) - **Domínio personalizado**
- 📝 [GIT_COMMANDS.md](./GIT_COMMANDS.md) - **Comandos Git úteis**
- 📊 [DEPLOY_SUMMARY.md](./DEPLOY_SUMMARY.md) - **Resumo das alterações**

**Desenvolvimento:**
- 🚀 [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) - **Referência rápida**
- 🏷️ [CATEGORIES_CRUD.md](./CATEGORIES_CRUD.md) - **CRUD de Categorias**
- 🔄 [DYNAMIC_CATEGORIES_FLOW.md](./DYNAMIC_CATEGORIES_FLOW.md) - **Fluxo de Categorias Dinâmicas**
- 🧪 [TESTE_RECUPERACAO.md](./TESTE_RECUPERACAO.md) - **Guia de teste (recuperação)**
- ⚙️ [BACKEND_SETUP.md](./BACKEND_SETUP.md) - **Setup do backend (recuperação de senha)**
- 🐛 [DEBUGGING.md](./DEBUGGING.md) - **Troubleshooting**
- 🔧 [TROUBLESHOOTING_ENV.md](./TROUBLESHOOTING_ENV.md) - **Problemas com variáveis de ambiente**

**Segurança & Autenticação:**
- [ACCESS_CONTROL.md](./ACCESS_CONTROL.md) - Controle de acesso (RBAC)
- [AUTH_INTEGRATION.md](./AUTH_INTEGRATION.md) - Autenticação OAuth2
- [PASSWORD_RECOVERY.md](./PASSWORD_RECOVERY.md) - Recuperação de senha
- [SECURITY_ARCHITECTURE.md](./SECURITY_ARCHITECTURE.md) - Arquitetura de segurança

## 🛠️ Tecnologias

### Frontend
- **React** + TypeScript
- **Tailwind CSS** para estilização
- **Shadcn/ui** para componentes
- **Recharts** para gráficos
- **Lucide React** para ícones
- **Sonner** para notificações toast

### Backend (API)
- **Java Spring Boot**
- **OAuth2** com JWT
- **PostgreSQL** (ou outro banco configurado)
- Endpoints RESTful
- Paginação automática

## 📡 API Integration

### Endpoints Disponíveis
- `/oauth2/token` - Autenticação OAuth2
- `/auth/recover-token` - Solicitar recuperação de senha
- `/auth/new-password` - Resetar senha com token
- `/categories` - Categorias de transações
- `/members` - Membros da família
- `/transactions` - Transações financeiras
- `/users` - Usuários do sistema (Admin)
- `/roles` - Roles/permissões (Admin)

**📖 Documentação Completa**: [API_INTEGRATION.md](./API_INTEGRATION.md)

## 📋 Pré-requisitos

### Desenvolvimento Local
1. **Node.js** v18 ou superior
2. **API Spring Boot** rodando em `http://localhost:8080`
3. Credenciais OAuth2 configuradas:
   - Client ID: `myclientid`
   - Client Secret: `myclientsecret`
4. Usuário com ROLE_ADMIN para gerenciar usuários

### Deploy em Produção (GitHub Pages)
1. Conta no GitHub
2. Backend hospedado (Heroku, Railway, Render, etc.)
3. CORS configurado no backend

📦 **Guia completo:** [DEPLOYMENT.md](./DEPLOYMENT.md)

## 🚀 Quick Start

### Desenvolvimento Local

```bash
# 1. Clone o repositório
git clone https://github.com/SEU-USUARIO/controle-financeiro-familiar.git
cd controle-financeiro-familiar

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env se necessário

# 4. Inicie o servidor de desenvolvimento
npm run dev

# 5. Acesse http://localhost:3000
```

### Deploy no GitHub Pages

```bash
# 1. Configure o repositório no GitHub
git remote add origin https://github.com/SEU-USUARIO/controle-financeiro-familiar.git

# 2. Habilite GitHub Pages
# Settings → Pages → Source: GitHub Actions

# 3. Faça push
git push origin main

# 4. Aguarde o deploy automático (2-3 minutos)
# Acesse: https://SEU-USUARIO.github.io/controle-financeiro-familiar/
```

📦 **Guias de deploy:**
- ⚡ **[DEPLOY_QUICK_START.md](./DEPLOY_QUICK_START.md)** - **Deploy em 5 minutos!**
- 📦 **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guia completo e detalhado
- 🌐 **[CUSTOM_DOMAIN.md](./CUSTOM_DOMAIN.md)** - Configurar domínio próprio

## 🎯 Como Usar

### 1. Login
Faça login com suas credenciais:
```
Usuário: [seu_usuario]
Senha: [sua_senha]
```

### 2. Navegação
Use as abas para navegar:
- **Dashboard**: Visão geral
- **Transações**: Gerenciar receitas/despesas
- **Membros**: Gerenciar família
- **Usuários**: Gerenciar usuários do sistema (apenas admin)
- **Relatórios**: Análises e gráficos

### 3. Privacidade
Clique no ícone de olho (👁️) no header para ocultar valores financeiros

### 4. Gerenciamento de Usuários (Admin)
Se você é admin, pode:
1. Acessar a aba "Usuários"
2. Criar novos usuários
3. Atribuir roles (ROLE_ADMIN, ROLE_USER)
4. Editar ou remover usuários

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- 💻 Desktop
- 📱 Tablet
- 📱 Mobile

## 📂 Estrutura de Arquivos

```
/
├── components/
│   ├── Dashboard.tsx          # Dashboard principal
│   ├── DashboardOverview.tsx  # Visão geral
│   ├── TransactionsView.tsx   # Lista de transações
│   ├── MembersManagement.tsx  # Gerenciar membros
│   ├── UsersManagement.tsx    # Gerenciar usuários (Admin)
│   ├── Reports.tsx            # Relatórios e gráficos
│   ├── LoginScreen.tsx        # Tela de login
│   ├── auth-service.ts        # Autenticação OAuth2 + RBAC
│   ├── api-service.ts         # Chamadas HTTP à API
│   └── api-helpers.ts         # Conversão de tipos
├── ACCESS_CONTROL.md          # Documentação RBAC
├── API_INTEGRATION.md         # Documentação da API
├── AUTH_INTEGRATION.md        # Documentação OAuth2
├── BACKEND_SETUP.md           # Setup backend (recuperação senha)
├── PASSWORD_RECOVERY.md       # Guia de recuperação de senha
├── SECURITY_ARCHITECTURE.md   # Arquitetura de segurança
├── DEBUGGING.md               # Guia de troubleshooting
├── CHANGELOG.md               # Histórico de mudanças
└── README.md                  # Este arquivo
```

## 🔄 Fluxo de Dados

```
Login → OAuth2 Token → JWT com Roles → UI Ajustada → Requisições Autenticadas → API
```

## 🐛 Troubleshooting

### API não conecta
1. Verifique se a API está rodando: `http://localhost:8080`
2. Confirme as credenciais OAuth2
3. Verifique o console do navegador (F12)

### Aba "Usuários" não aparece
- Verifique se seu usuário tem `ROLE_ADMIN`
- Faça logout e login novamente para atualizar o token

### Token expirado
- O token expira após 24 horas
- Faça login novamente

## 📚 Documentação Adicional

- **[ACCESS_CONTROL.md](./ACCESS_CONTROL.md)**: Controle de acesso e RBAC
- **[API_INTEGRATION.md](./API_INTEGRATION.md)**: Integração com a API
- **[AUTH_INTEGRATION.md](./AUTH_INTEGRATION.md)**: Autenticação OAuth2
- **[CHANGELOG.md](./CHANGELOG.md)**: Histórico de versões
- **[DEBUGGING.md](./DEBUGGING.md)**: Guia de debugging

## 🎨 Funcionalidades de UX

- ✅ Loading states em todas as operações
- ✅ Mensagens de erro claras
- ✅ Confirmações antes de deletar
- ✅ Feedback visual com toasts
- ✅ Validação de formulários
- ✅ Estados vazios amigáveis
- ✅ Indicadores de loading
- ✅ Atualização manual de dados

## 📜 Licença

Projeto desenvolvido para uso interno familiar.

---

**Versão Atual**: 2.1 - CRUD de Usuários com RBAC  
**Data**: 29 de Outubro de 2025  
**Status**: ✅ Produção (Debug removido)
