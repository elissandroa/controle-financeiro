# 🔒 Arquitetura de Segurança - Recuperação de Senha

## Divisão de Responsabilidades

### 🎨 Frontend (React)

#### Responsabilidades
- ✅ Extrair token da URL (`/recover-password/{token}`)
- ✅ Validar formato de email (UX, não segurança)
- ✅ Validar senha mínimo 6 caracteres (UX, não segurança)
- ✅ Confirmar correspondência de senhas
- ✅ Enviar requisição para backend com token + senha
- ✅ Exibir resposta do backend (sucesso ou erro)

#### NÃO faz (Segurança)
- ❌ **NÃO** valida se token é válido
- ❌ **NÃO** valida se token expirou
- ❌ **NÃO** valida se token foi usado
- ❌ **NÃO** verifica token no banco de dados
- ❌ **NÃO** decide se token é aceito ou rejeitado

#### Código Frontend

```typescript
// ResetPasswordScreen.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validações UX (não de segurança)
  if (!password.trim()) {
    toast.error('Digite a nova senha');
    return;
  }

  if (password.length < 6) {
    toast.error('A senha deve ter no mínimo 6 caracteres');
    return;
  }

  if (password !== confirmPassword) {
    toast.error('As senhas não coincidem');
    return;
  }

  try {
    // Apenas ENVIA para o backend
    // Backend decide se aceita ou rejeita
    await passwordRecoveryApi.resetPassword(token, password);
    
    // Exibe resposta de sucesso
    setIsSuccess(true);
    toast.success('Senha alterada com sucesso!');
  } catch (error: any) {
    // Exibe erro retornado pelo BACKEND
    toast.error(error.message || 'Erro ao redefinir senha');
  }
};
```

### 🔒 Backend (Spring Boot)

#### Responsabilidades Obrigatórias
- ✅ **Gerar token UUID único**
- ✅ **Armazenar token no banco de dados**
- ✅ **Validar se token existe**
- ✅ **Validar se token não expirou**
- ✅ **Validar se token não foi usado**
- ✅ **Validar se token pertence a usuário válido**
- ✅ **Invalidar token após uso**
- ✅ **Aplicar rate limiting**
- ✅ **Enviar email com link**
- ✅ **Alterar senha no banco de dados**
- ✅ **Retornar erros específicos**

#### Código Backend (Exemplo)

```java
@Service
public class PasswordRecoveryService {
    
    @Autowired
    private PasswordResetTokenRepository tokenRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    // 1. Solicitar recuperação
    public void requestRecovery(EmailRecoveryRequest request) {
        String email = request.getTo();
        User user = userRepository.findByEmail(email);
        
        // Não revelar se email existe (segurança)
        if (user == null) {
            log.warn("Tentativa de recuperação com email inexistente: {}", email);
            return; // Retorna sucesso mesmo assim
        }
        
        // Gerar token único
        String token = UUID.randomUUID().toString();
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(24);
        
        // Salvar no banco
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiresAt(expiresAt);
        resetToken.setUsed(false);
        tokenRepository.save(resetToken);
        
        // Enviar email
        String link = "http://localhost:8080/recover-password/" + token;
        emailService.sendPasswordRecoveryEmail(user.getEmail(), link);
    }
    
    // 2. Resetar senha
    public void resetPassword(String token, String newPassword) {
        // VALIDAÇÃO 1: Token existe?
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
            .orElseThrow(() -> new InvalidTokenException("Token inválido"));
        
        // VALIDAÇÃO 2: Token não expirou?
        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Token expirado");
        }
        
        // VALIDAÇÃO 3: Token não foi usado?
        if (resetToken.isUsed()) {
            throw new InvalidTokenException("Token já utilizado");
        }
        
        // VALIDAÇÃO 4: Usuário válido?
        User user = resetToken.getUser();
        if (user == null || !user.isActive()) {
            throw new InvalidTokenException("Usuário inválido");
        }
        
        // Alterar senha
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Invalidar token
        resetToken.setUsed(true);
        resetToken.setUsedAt(LocalDateTime.now());
        tokenRepository.save(resetToken);
        
        log.info("Senha alterada com sucesso para usuário: {}", user.getEmail());
    }
}
```

## Por que o Frontend NÃO valida o token?

### 🚨 Razões de Segurança

1. **JavaScript é código público**
   - Qualquer usuário pode ver e modificar o código do frontend
   - Validações no frontend podem ser burladas
   - Usuário malicioso pode alterar validações no DevTools

2. **Dados sensíveis no backend**
   - Token está no banco de dados (backend)
   - Status de uso está no banco (backend)
   - Data de expiração está no banco (backend)
   - Frontend não tem acesso direto ao banco

3. **Autenticação centralizada**
   - Backend é a única fonte de verdade
   - Backend controla quem pode fazer o quê
   - Frontend apenas consome APIs protegidas

4. **Princípio do Zero Trust**
   - Nunca confie no cliente (frontend)
   - Sempre valide no servidor (backend)
   - Cliente pode ser comprometido

### ✅ Arquitetura Correta

```
                  Frontend (React)
                        |
                        | 1. Envia token + senha
                        ↓
                  Backend (Spring Boot)
                        |
        +---------------+---------------+
        |               |               |
    Valida Token   Valida Senha   Valida Usuário
        |               |               |
        +---------------+---------------+
                        |
                ✅ ou ❌ Resposta
                        |
                        ↓
                  Frontend (React)
                        |
              Exibe sucesso ou erro
```

### ❌ Arquitetura Incorreta (NÃO FAZER)

```
                  Frontend (React)
                        |
            Valida token no frontend? ❌
                        |
        +---------------+---------------+
        |                               |
    Token OK?                      Token ruim?
        |                               |
    Envia para backend            Mostra erro
        |
    Backend aceita sem validar? ❌
```

## Fluxo Completo com Responsabilidades

### 1. Solicitar Recuperação

```
Frontend:
1. Usuário digita email
2. Valida formato (UX)
3. POST /auth/recover-token

Backend:
1. Recebe email
2. Valida se email existe
3. Gera token UUID
4. Salva no banco com expiração
5. Envia email com link
6. Retorna sucesso genérico

Frontend:
1. Exibe mensagem de sucesso
2. Instrui verificar email
```

### 2. Clicar no Link

```
Email:
1. Usuário recebe email
2. Clica no link

Navegador:
1. Abre URL: /recover-password/{token}
2. Carrega aplicação React

Frontend:
1. App.tsx extrai token da URL
2. Renderiza ResetPasswordScreen
3. Passa token como prop
4. Aguarda usuário digitar senha
```

### 3. Resetar Senha

```
Frontend:
1. Usuário digita senha
2. Confirma senha
3. Valida formato (UX)
4. PUT /auth/new-password
   Body: { token, password }

Backend:
1. Recebe token + senha
2. ✅ Valida token existe
3. ✅ Valida token não expirou
4. ✅ Valida token não foi usado
5. ✅ Valida usuário existe
6. ✅ Altera senha
7. ✅ Invalida token
8. Retorna sucesso

Frontend:
1. Recebe resposta
2. Exibe sucesso
3. Redireciona para login
```

### 4. Erro de Token

```
Frontend:
1. Usuário digita senha
2. PUT /auth/new-password

Backend:
1. Recebe token + senha
2. ❌ Token inválido/expirado/usado
3. Retorna erro 400

Frontend:
1. Catch do erro
2. Exibe: "Token inválido ou expirado"
3. Sugere solicitar novo email
```

## Validações por Camada

### Validações de UX (Frontend)

**Objetivo:** Melhorar experiência do usuário, evitar requisições desnecessárias

| Campo | Validação | Motivo |
|-------|-----------|--------|
| Email | Formato válido | Evitar erro de digitação |
| Email | Não vazio | UX |
| Senha | Não vazia | UX |
| Senha | Mínimo 6 caracteres | UX |
| Confirmação | Igual à senha | Evitar erro de digitação |

**Importante:** Estas validações podem ser burladas. Backend DEVE validar novamente.

### Validações de Segurança (Backend)

**Objetivo:** Proteger sistema, garantir integridade

| Campo | Validação | Motivo |
|-------|-----------|--------|
| Email | Existe no banco | Segurança |
| Email | Rate limiting | Anti-abuse |
| Token | Existe no banco | Segurança |
| Token | Não expirou | Segurança |
| Token | Não foi usado | Segurança |
| Token | Usuário válido | Segurança |
| Senha | Mínimo 8 caracteres | Segurança (pode ser > que frontend) |
| Senha | Complexidade | Segurança (opcional) |

**Crítico:** Estas validações NÃO podem ser burladas. São a última linha de defesa.

## Comunicação entre Camadas

### Frontend → Backend

```typescript
// Frontend envia (não valida token)
await fetch('/auth/new-password', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: "4813524e-ec0e-437a-8b41-e4476f77d684", // Apenas repassa
    password: "novaSenha123"
  })
});
```

### Backend → Frontend

**Sucesso:**
```json
{
  "message": "Senha alterada com sucesso"
}
```

**Erro:**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Token inválido ou expirado",
  "timestamp": "2025-10-30T12:00:00Z"
}
```

### Frontend processa resposta

```typescript
try {
  const response = await passwordRecoveryApi.resetPassword(token, password);
  // Backend disse que está OK
  toast.success('Senha alterada com sucesso!');
} catch (error: any) {
  // Backend disse que NÃO está OK
  toast.error(error.message || 'Erro ao redefinir senha');
}
```

## Exemplo de Ataque Prevenido

### Tentativa de Ataque

```javascript
// Usuário malicioso tenta burlar validação do frontend
// Abre DevTools > Console
fetch('/auth/new-password', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    token: "token-inventado-12345", // Token falso
    password: "hack"
  })
});
```

### Backend responde

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Token inválido",
  "timestamp": "2025-10-30T12:00:00Z"
}
```

### Resultado

❌ **Ataque falhou** porque:
1. Backend validou o token
2. Token não existe no banco
3. Backend rejeitou a requisição
4. Senha não foi alterada

✅ **Sistema protegido** porque:
- Backend é a única fonte de verdade
- Frontend pode ser burlado, mas backend não
- Validações críticas estão no backend

## Checklist de Implementação

### ✅ Frontend (React)

- [x] Extrair token da URL
- [x] Validar formato de email (UX)
- [x] Validar senha mínimo 6 caracteres (UX)
- [x] Confirmar senhas coincidem
- [x] Enviar token + senha para backend
- [x] Exibir resposta de sucesso
- [x] Exibir erros do backend
- [x] Não validar token (deixar pro backend)

### ✅ Backend (Spring Boot)

- [ ] Endpoint POST /auth/recover-token
- [ ] Gerar token UUID único
- [ ] Salvar token no banco com expiração
- [ ] Enviar email com link
- [ ] Endpoint PUT /auth/new-password
- [ ] Validar token existe
- [ ] Validar token não expirou
- [ ] Validar token não foi usado
- [ ] Validar usuário válido
- [ ] Alterar senha
- [ ] Invalidar token após uso
- [ ] Rate limiting
- [ ] Retornar erros específicos

## Conclusão

### Princípios-Chave

1. **Frontend = Interface**: Coleta dados, exibe resultados
2. **Backend = Segurança**: Valida tudo, decide acesso
3. **Nunca confiar no cliente**: Sempre validar no servidor
4. **Separação de responsabilidades**: Cada camada faz seu trabalho

### Mantra de Segurança

> "O frontend é apenas uma interface bonita.  
> O backend é onde a segurança realmente acontece.  
> Nunca, jamais, em hipótese alguma,  
> confie em validações do frontend para segurança."

---

**Versão:** 2.3  
**Data:** 30 de Outubro de 2025  
**Autor:** Arquitetura de Segurança do Sistema
