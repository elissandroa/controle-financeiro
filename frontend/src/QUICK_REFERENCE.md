# 🚀 Referência Rápida - Recuperação de Senha

## TL;DR

### O que o Frontend FAZ ✅

```typescript
// 1. Extrair token da URL
const token = window.location.pathname.match(/\/recover-password\/([a-f0-9-]+)/)[1];

// 2. Validar UX (não segurança)
if (password.length < 6) {
  toast.error('Mínimo 6 caracteres');
}

// 3. Enviar para backend
await fetch('/auth/new-password', {
  method: 'PUT',
  body: JSON.stringify({ token, password })
});

// 4. Exibir resposta
toast.success('Senha alterada!');
```

### O que o Frontend NÃO FAZ ❌

```typescript
// ❌ NÃO FAZER ISSO
if (token.isValid()) { // Frontend não sabe se token é válido
  // ...
}

if (token.isExpired()) { // Frontend não tem acesso ao banco
  // ...
}

if (token.isUsed()) { // Frontend não controla isso
  // ...
}
```

### O que o Backend FAZ ✅

```java
// Backend valida TUDO
public void resetPassword(String token, String password) {
    // ✅ Token existe?
    PasswordResetToken resetToken = repository.findByToken(token);
    
    // ✅ Token não expirou?
    if (resetToken.getExpiresAt().isBefore(now())) {
        throw new InvalidTokenException();
    }
    
    // ✅ Token não foi usado?
    if (resetToken.isUsed()) {
        throw new InvalidTokenException();
    }
    
    // ✅ Alterar senha
    user.setPassword(encode(password));
    
    // ✅ Invalidar token
    resetToken.setUsed(true);
}
```

## Fluxo Simplificado

```
┌─────────────────────────────────────────────────────────────┐
│                    1. SOLICITAR RECUPERAÇÃO                  │
├─────────────────────────────────────────────────────────────┤
│ Frontend: Coleta email                                       │
│ Frontend: POST /auth/recover-token                           │
│ Backend:  Gera token UUID                                    │
│ Backend:  Salva no banco                                     │
│ Backend:  Envia email                                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    2. CLICAR NO LINK                         │
├─────────────────────────────────────────────────────────────┤
│ Email:    Link → http://localhost:5173/recover-password/... │
│           ⚠️ IMPORTANTE: Link deve apontar para FRONTEND!   │
│ Browser:  Abre /recover-password/{token}                     │
│ Frontend: Extrai token da URL                                │
│ Frontend: Renderiza tela de reset                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    3. RESETAR SENHA                          │
├─────────────────────────────────────────────────────────────┤
│ Frontend: Coleta senha                                       │
│ Frontend: Valida formato (UX)                                │
│ Frontend: PUT /auth/new-password                             │
│ Backend:  Valida token ✅                                    │
│ Backend:  Valida não expirado ✅                             │
│ Backend:  Valida não usado ✅                                │
│ Backend:  Altera senha ✅                                    │
│ Backend:  Invalida token ✅                                  │
│ Backend:  Retorna sucesso                                    │
│ Frontend: Exibe sucesso                                      │
│ Frontend: Redireciona para login                             │
└─────────────────────────────────────────────────────────────┘
```

## Divisão Clara de Responsabilidades

### 🎨 Frontend

| Tarefa | Faz? | Motivo |
|--------|------|--------|
| Extrair token da URL | ✅ SIM | Navegação |
| Validar formato de email | ✅ SIM | UX |
| Validar senha mínimo 6 chars | ✅ SIM | UX |
| Confirmar senhas coincidem | ✅ SIM | UX |
| Enviar requisição | ✅ SIM | API |
| Exibir resposta | ✅ SIM | UI |
| **Validar token** | ❌ **NÃO** | **SEGURANÇA** |
| **Validar expiração** | ❌ **NÃO** | **SEGURANÇA** |
| **Validar se foi usado** | ❌ **NÃO** | **SEGURANÇA** |
| **Alterar senha** | ❌ **NÃO** | **SEGURANÇA** |

### 🔒 Backend

| Tarefa | Faz? | Motivo |
|--------|------|--------|
| Gerar token UUID | ✅ SIM | Segurança |
| Salvar token no banco | ✅ SIM | Persistência |
| **Validar token existe** | ✅ **SIM** | **SEGURANÇA** |
| **Validar não expirou** | ✅ **SIM** | **SEGURANÇA** |
| **Validar não foi usado** | ✅ **SIM** | **SEGURANÇA** |
| **Validar usuário** | ✅ **SIM** | **SEGURANÇA** |
| Alterar senha | ✅ SIM | Banco de dados |
| Invalidar token | ✅ SIM | Segurança |
| Enviar email | ✅ SIM | Comunicação |
| Aplicar rate limiting | ✅ SIM | Anti-abuse |

## Endpoints

### POST /auth/recover-token

**Request:**
```json
{
  "to": "usuario@example.com",
  "subject": "Recuperação de Senha",
  "body": "Recuperação de Senha você tem 30 minutos para utilizar o token contido nesse email:"
}
```

**Response (sempre mesmo):**
```json
{
  "message": "Email de recuperação enviado (se o endereço existir)"
}
```

**Observação:** O frontend envia automaticamente `subject` e `body` predefinidos.

**Backend valida:**
- ✅ Email existe? (não revela ao frontend)
- ✅ Rate limit não excedido?

### PUT /auth/new-password

**Request:**
```json
{
  "token": "4813524e-ec0e-437a-8b41-e4476f77d684",
  "newPassword": "novaSenha123"
}
```

**Response Sucesso:**
```json
{
  "message": "Senha alterada com sucesso"
}
```

**Response Erro:**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Token inválido ou expirado"
}
```

**Backend valida:**
- ✅ Token existe?
- ✅ Token não expirou?
- ✅ Token não foi usado?
- ✅ Senha atende requisitos?

## Regra de Ouro

```
┌──────────────────────────────────────────────────────────┐
│                                                           │
│   FRONTEND = Interface bonita que coleta dados           │
│   BACKEND  = Cérebro que decide o que é permitido        │
│                                                           │
│   Nunca, jamais, confie no frontend para segurança!      │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## Componentes Criados

### ForgotPasswordDialog.tsx

```tsx
<ForgotPasswordDialog
  open={showDialog}
  onOpenChange={setShowDialog}
/>
```

**Faz:**
- ✅ Modal para digitar email
- ✅ Validação de formato (UX)
- ✅ POST /auth/recover-token
- ✅ Tela de sucesso

**NÃO faz:**
- ❌ Validar token

### ResetPasswordScreen.tsx

```tsx
<ResetPasswordScreen
  token="uuid-do-token"  // Extraído da URL
  onSuccess={() => navigate('/login')}
  onCancel={() => navigate('/login')}
/>
```

**Faz:**
- ✅ Formulário de nova senha
- ✅ Validação de formato (UX)
- ✅ PUT /auth/new-password
- ✅ Exibir sucesso/erro

**NÃO faz:**
- ❌ Validar token
- ❌ Verificar expiração
- ❌ Consultar banco

### passwordRecoveryApi (api-service.ts)

```typescript
// Apenas wrapper para fetch
await passwordRecoveryApi.requestRecovery(email);
await passwordRecoveryApi.resetPassword(token, password);
```

**Faz:**
- ✅ Requisições HTTP
- ✅ Tratamento de erros

**NÃO faz:**
- ❌ Validação de token
- ❌ Lógica de negócio

## Exemplos de Código

### ✅ CORRETO

```typescript
// Frontend
const handleSubmit = async () => {
  // Validação UX
  if (password.length < 6) {
    toast.error('Mínimo 6 caracteres');
    return;
  }

  try {
    // Apenas ENVIA
    await passwordRecoveryApi.resetPassword(token, password);
    
    // BACKEND decidiu que está OK
    toast.success('Senha alterada!');
  } catch (error) {
    // BACKEND decidiu que NÃO está OK
    toast.error(error.message);
  }
};
```

### ❌ INCORRETO

```typescript
// Frontend
const handleSubmit = async () => {
  // ❌ NÃO FAZER: Frontend validando token
  if (!isTokenValid(token)) {
    toast.error('Token inválido');
    return;
  }

  // ❌ NÃO FAZER: Frontend verificando expiração
  if (isTokenExpired(token)) {
    toast.error('Token expirado');
    return;
  }

  // ❌ Frontend não tem essas informações!
  // Deixa o BACKEND decidir!
}
```

## Checklist de Implementação

### Frontend ✅

- [x] ForgotPasswordDialog.tsx criado
- [x] ResetPasswordScreen.tsx criado
- [x] passwordRecoveryApi em api-service.ts
- [x] Roteamento /recover-password/:token
- [x] Validações UX (não segurança)
- [x] Exibição de erros do backend
- [x] **NÃO valida token**

### Backend (Pendente) ⏳

- [ ] POST /auth/recover-token implementado
- [ ] PUT /auth/new-password implementado
- [ ] Validação de token no banco
- [ ] Validação de expiração
- [ ] Validação de uso único
- [ ] Invalidação após uso
- [ ] Envio de email
- [ ] Rate limiting
- [ ] Testes unitários

## Links de Documentação

- 📖 [PASSWORD_RECOVERY.md](./PASSWORD_RECOVERY.md) - Guia completo
- 🔒 [SECURITY_ARCHITECTURE.md](./SECURITY_ARCHITECTURE.md) - Arquitetura de segurança
- 🔐 [AUTH_INTEGRATION.md](./AUTH_INTEGRATION.md) - OAuth2 e autenticação
- 🐛 [DEBUGGING.md](./DEBUGGING.md) - Troubleshooting

## Perguntas Frequentes

**Q: O frontend valida o token?**  
A: **NÃO.** O frontend apenas extrai da URL e envia para o backend.

**Q: Quem decide se o token é válido?**  
A: **O BACKEND.** Sempre.

**Q: O que acontece se o token for inválido?**  
A: **O BACKEND retorna erro 400.** O frontend exibe a mensagem.

**Q: O frontend verifica expiração?**  
A: **NÃO.** Isso é responsabilidade do backend.

**Q: O frontend consulta o banco de dados?**  
A: **NÃO.** Frontend só faz requisições HTTP.

**Q: Posso fazer validação de token no frontend para melhorar UX?**  
A: **NÃO.** Validações de segurança só no backend. Frontend faz UX (formato, tamanho).

**Q: E se eu quiser saber se o token expirou antes de enviar?**  
A: **NÃO FAÇA.** Envie para o backend. Ele dirá se está expirado.

## Resumo em 3 Frases

1. **Frontend coleta dados e exibe resultados**
2. **Backend valida tudo e decide acesso**
3. **Nunca confie no frontend para segurança**

---

**Versão:** 2.3.1  
**Data:** 30 de Outubro de 2025  
**Última Atualização:** Clarificação de responsabilidades de segurança
