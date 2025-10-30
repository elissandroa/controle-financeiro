# 🔑 Sistema de Recuperação de Senha

Documentação completa do fluxo de recuperação de senha do sistema.

## 📋 Visão Geral

O sistema permite que usuários que esqueceram suas senhas possam redefini-las através de um link enviado por email.

## 🔄 Fluxo Completo

### 1. Solicitar Recuperação

```
Usuário → "Esqueci minha senha" → Modal → Digite Email → Enviar
```

**Componente:** `ForgotPasswordDialog.tsx`

**Endpoint:** `POST /auth/recover-token`

**Request:**
```json
{
  "to": "usuario@example.com",
  "subject": "Recuperação de Senha",
  "body": "Recuperação de Senha você tem 30 minutos para utilizar o token contido nesse email:"
}
```

**Response:**
```json
{
  "message": "Email de recuperação enviado"
}
```

**Observação:** O frontend monta automaticamente o JSON completo. O usuário apenas informa o email no modal.

**Customização:** Para alterar o assunto ou corpo do email, edite os valores em `/components/api-service.ts` no método `requestRecovery`:
```typescript
body: JSON.stringify({
  to: email,
  subject: 'Seu Assunto Personalizado', // Altere aqui
  body: 'Seu texto personalizado aqui' // Altere aqui
})
```

### 2. Email Enviado

O backend envia um email para o usuário contendo:

- Link de recuperação único
- Instruções de uso
- **Prazo de validade: 30 minutos** (conforme configurado na API)

**Formato do Link:**
```
http://localhost:5173/recover-password/4813524e-ec0e-437a-8b41-e4476f77d684
         ↑                                └── Token UUID único
    Porta do Frontend React (não 8080!)
```

⚠️ **IMPORTANTE - Configuração do Link:**

O link deve apontar para o **FRONTEND (React)**, NÃO para o backend!

| Ambiente | URL Correta do Link |
|----------|---------------------|
| Desenvolvimento | `http://localhost:5173/recover-password/{token}` |
| Produção | `https://seu-dominio.com/recover-password/{token}` |

❌ **Incorreto:** `http://localhost:8080/recover-password/{token}` (porta do backend)  
✅ **Correto:** `http://localhost:5173/recover-password/{token}` (porta do frontend)

**Conteúdo do Email:**
- **Para:** Email do usuário
- **Assunto:** "Recuperação de Senha"
- **Corpo:** "Recuperação de Senha você tem 30 minutos para utilizar o token contido nesse email:"
- **Link:** URL com token único apontando para o FRONTEND

### 3. Resetar Senha

```
Usuário → Clica Link → Tela Reset → Nova Senha → Confirmar → Salvar
```

**Componente:** `ResetPasswordScreen.tsx`

**Endpoint:** `PUT /auth/new-password`

**Request:**
```json
{
  "token": "4813524e-ec0e-437a-8b41-e4476f77d684",
  "newPassword": "novaSenha123"
}
```

**Response de Sucesso:**
```json
{
  "message": "Senha alterada com sucesso"
}
```

**Response de Erro (Token Inválido):**
```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "Token inválido ou expirado"
}
```

⚠️ **IMPORTANTE:** A validação do token (validade, expiração, uso único) é **responsabilidade do backend**. O frontend apenas:
1. Extrai o token da URL
2. Envia para o backend
3. Exibe a resposta (sucesso ou erro)

### 4. Redirecionamento

```
Sucesso → Toast → 2 segundos → Login Screen
```

## ⚙️ Configuração do Backend (ESSENCIAL)

### 🔗 Configuração da URL do Frontend

⚠️ **CRÍTICO:** O backend **DEVE** ser configurado com a URL do frontend para gerar os links de recuperação corretamente!

**application.properties:**
```properties
# URL do Frontend (onde a aplicação React está rodando)
frontend.url=http://localhost:5173

# Em produção:
# frontend.url=https://seu-dominio.com
```

**application.yml:**
```yaml
frontend:
  url: http://localhost:5173
  
# Em produção:
# frontend:
#   url: https://seu-dominio.com
```

### Implementação no Service do Backend

```java
@Service
public class PasswordRecoveryService {
    
    @Value("${frontend.url}")
    private String frontendUrl;
    
    @Autowired
    private EmailService emailService;
    
    public void sendRecoveryEmail(String email, String token) {
        // ✅ CORRETO - Link aponta para o FRONTEND
        String recoveryLink = frontendUrl + "/recover-password/" + token;
        
        String emailBody = "Recuperação de Senha você tem 30 minutos " +
                          "para utilizar o token contido nesse email:\n\n" +
                          recoveryLink;
        
        emailService.send(
            email,
            "Recuperação de Senha",
            emailBody
        );
    }
}
```

### Exemplo de Email Correto

```
Para: usuario@example.com
Assunto: Recuperação de Senha

Corpo:
Recuperação de Senha você tem 30 minutos para utilizar o token contido nesse email:

http://localhost:5173/recover-password/4813524e-ec0e-437a-8b41-e4476f77d684
         ↑                               ↑
    Porta do Frontend            Token UUID único
    (NÃO 8080!)
```

### Tabela de Verificação

| Componente | Porta Padrão | URL Exemplo | Recebe Links? |
|------------|--------------|-------------|---------------|
| **Backend (API)** | 8080 | `http://localhost:8080/api/...` | ❌ NÃO |
| **Frontend (React)** | 5173 | `http://localhost:5173/` | ✅ SIM |
| **Link Recuperação** | 5173 | `http://localhost:5173/recover-password/{token}` | ✅ SIM |

### ❌ Erro Comum vs ✅ Solução

```java
// ❌ INCORRETO - Link aponta para o próprio backend
String link = "http://localhost:8080/recover-password/" + token;
// Usuário clica → erro 404 ou página em branco

// ✅ CORRETO - Link aponta para o frontend
@Value("${frontend.url}")
private String frontendUrl;

String link = frontendUrl + "/recover-password/" + token;
// Usuário clica → abre tela React de reset de senha
```

---

## 🎨 Componentes

### ForgotPasswordDialog

**Localização:** `/components/ForgotPasswordDialog.tsx`

**Props:**
```typescript
interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**Funcionalidades:**
- ✅ Validação de email (formato válido)
- ✅ Estados: formulário, loading, sucesso
- ✅ Tela de sucesso com instruções
- ✅ Ícones visuais (Mail, CheckCircle2, Loader2)
- ✅ Feedback de erros
- ✅ Design responsivo

**Uso:**
```tsx
import { ForgotPasswordDialog } from './components/ForgotPasswordDialog';

function LoginScreen() {
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  return (
    <>
      <button onClick={() => setShowForgotPassword(true)}>
        Esqueci minha senha
      </button>
      
      <ForgotPasswordDialog
        open={showForgotPassword}
        onOpenChange={setShowForgotPassword}
      />
    </>
  );
}
```

### ResetPasswordScreen

**Localização:** `/components/ResetPasswordScreen.tsx`

**Props:**
```typescript
interface ResetPasswordScreenProps {
  token: string;
  onSuccess: () => void;
  onCancel: () => void;
}
```

**Funcionalidades:**
- ✅ Validação de senha (mínimo 6 caracteres)
- ✅ Confirmação de senha obrigatória
- ✅ Toggle de visualização (olho)
- ✅ Estados: formulário, loading, sucesso
- ✅ Tela de sucesso com redirecionamento automático
- ✅ Design full-screen com gradient
- ✅ Ícones visuais (Lock, Eye, EyeOff, CheckCircle2)

**Uso:**
```tsx
import { ResetPasswordScreen } from './components/ResetPasswordScreen';

function App() {
  const [resetToken, setResetToken] = useState<string | null>(null);

  // Token extraído da URL
  useEffect(() => {
    const match = window.location.pathname.match(/\/recover-password\/([a-f0-9-]+)/);
    if (match) {
      setResetToken(match[1]);
    }
  }, []);

  if (resetToken) {
    return (
      <ResetPasswordScreen
        token={resetToken}
        onSuccess={() => {/* redirecionar para login */}}
        onCancel={() => {/* voltar para login */}}
      />
    );
  }
}
```

## 🛠️ API Service

**Localização:** `/components/api-service.ts`

### passwordRecoveryApi

```typescript
export const passwordRecoveryApi = {
  // Solicitar recuperação de senha
  requestRecovery: async (email: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/recover-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });
    return handleResponse<{ message: string }>(response);
  },

  // Resetar senha com token
  resetPassword: async (token: string, newPassword: string): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/auth/new-password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password: newPassword }),
    });
    return handleResponse<{ message: string }>(response);
  },
};
```

**Uso:**
```typescript
import { passwordRecoveryApi } from './components/api-service';

// Solicitar recuperação (usuário digita apenas o email)
try {
  await passwordRecoveryApi.requestRecovery('usuario@example.com');
  // Frontend envia automaticamente:
  // {
  //   "to": "usuario@example.com",
  //   "subject": "Recuperação de Senha",
  //   "body": "Recuperação de Senha você tem 30 minutos..."
  // }
  console.log('Email enviado!');
} catch (error) {
  console.error('Erro:', error.message);
}

// Resetar senha
try {
  await passwordRecoveryApi.resetPassword('token-uuid', 'novaSenha123');
  console.log('Senha alterada!');
} catch (error) {
  console.error('Erro:', error.message);
}
```

## 🔐 Segurança

### Divisão de Responsabilidades

#### 🎨 Frontend (React)
- ✅ Extrai token da URL
- ✅ Valida formato de email (UX)
- ✅ Valida senha mínimo 6 caracteres (UX)
- ✅ Confirma correspondência de senhas (UX)
- ✅ Envia token + senha para backend
- ✅ Exibe resposta do backend

#### 🔒 Backend (Spring Boot)
- ✅ Gera token UUID único
- ✅ Valida se email existe
- ✅ **Valida se token é válido**
- ✅ **Valida se token não expirou**
- ✅ **Valida se token não foi usado**
- ✅ Aplica rate limiting
- ✅ Hash do token no banco
- ✅ Envia email
- ✅ Altera senha no banco

⚠️ **CRÍTICO:** O frontend **NÃO** valida o token. Toda validação de token é feita no backend por segurança.

### Boas Práticas Implementadas

✅ **Token UUID Único**
- Gerado pelo backend para cada solicitação
- Imprevisível e seguro
- Validado apenas no backend

✅ **Token no Body**
- Enviado via JSON no body da requisição
- Não exposto na URL em requisições
- Frontend apenas repassa para backend

✅ **Validação de Email**
- Regex no frontend (UX)
- Backend verifica se email existe (segurança)

✅ **Validação de Senha**
- Mínimo 6 caracteres (frontend UX)
- Backend pode ter regras adicionais
- Confirmação obrigatória

✅ **Senha Nunca no Email**
- Email contém apenas link
- Senha só é definida na tela de reset

✅ **Feedback de Erros**
- Backend retorna erros específicos
- Frontend exibe mensagens claras
- Não expõe informações sensíveis

### Configuração do Link no Email (CRÍTICO)

⚠️ **O backend DEVE gerar o link apontando para o FRONTEND, não para si mesmo!**

```java
// ❌ INCORRETO - Link aponta para o backend
String link = "http://localhost:8080/recover-password/" + token;

// ✅ CORRETO - Link aponta para o frontend
String frontendUrl = environment.getProperty("frontend.url"); // http://localhost:5173
String link = frontendUrl + "/recover-password/" + token;
// Resultado: http://localhost:5173/recover-password/{token}
```

**Configuração no application.properties:**
```properties
# Desenvolvimento
frontend.url=http://localhost:5173

# Produção
# frontend.url=https://seu-dominio.com
```

### Responsabilidades do Backend (OBRIGATÓRIO)

⚠️ **Validação de Token**
```java
// Backend DEVE validar:
// 1. Token existe no banco
// 2. Token não expirou
// 3. Token não foi usado
// 4. Token pertence ao usuário correto

public void validateToken(String token) throws InvalidTokenException {
    PasswordResetToken resetToken = tokenRepository.findByToken(token);
    
    if (resetToken == null) {
        throw new InvalidTokenException("Token inválido");
    }
    
    if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
        throw new InvalidTokenException("Token expirado");
    }
    
    if (resetToken.isUsed()) {
        throw new InvalidTokenException("Token já utilizado");
    }
}
```

⚠️ **Token com Expiração**
```java
// Expirar em 24-48 horas
LocalDateTime expiresAt = LocalDateTime.now().plusHours(24);
```

⚠️ **Token de Uso Único**
```java
// Invalidar após uso
token.setUsed(true);
token.setUsedAt(LocalDateTime.now());
tokenRepository.save(token);
```

⚠️ **Rate Limiting**
```java
// Máximo 3 tentativas por hora por email
@RateLimit(max = 3, window = 1, unit = TimeUnit.HOURS)
```

⚠️ **Email Real**
```java
// Apenas enviar se email existir
User user = userRepository.findByEmail(email);
if (user == null) {
  // Log tentativa suspeita
  // Retornar mensagem genérica (não revelar se email existe)
  return ResponseEntity.ok("Email enviado (se o endereço existir)");
}
```

⚠️ **Hash do Token**
```java
// OPCIONAL: Armazenar hash do token, não token puro
String tokenHash = BCrypt.hashpw(token, BCrypt.gensalt());
// Porém, complica o fluxo. UUID já é seguro o suficiente.
```

⚠️ **Resposta de Erro Padronizada**
```java
// Retornar erro 400 com mensagem clara
@ExceptionHandler(InvalidTokenException.class)
public ResponseEntity<ErrorResponse> handleInvalidToken(InvalidTokenException ex) {
    return ResponseEntity
        .status(HttpStatus.BAD_REQUEST)
        .body(new ErrorResponse("Token inválido ou expirado"));
}
```

## 📧 Template de Email

### Exemplo HTML

```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .button { 
      display: inline-block; 
      padding: 12px 24px; 
      background-color: #4F46E5; 
      color: white; 
      text-decoration: none; 
      border-radius: 6px; 
    }
    .footer { color: #666; font-size: 12px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <h2>Recuperação de Senha</h2>
    <p>Olá,</p>
    <p>Você solicitou a recuperação de senha para sua conta.</p>
    <p>Clique no botão abaixo para redefinir sua senha:</p>
    
    <p>
      <a href="http://localhost:8080/recover-password/${TOKEN}" class="button">
        Redefinir Senha
      </a>
    </p>
    
    <p>Ou copie e cole este link no seu navegador:</p>
    <p style="background-color: #f5f5f5; padding: 10px; border-radius: 4px;">
      http://localhost:8080/recover-password/${TOKEN}
    </p>
    
    <div class="footer">
      <p><strong>Importante:</strong></p>
      <ul>
        <li>Este link expira em 24 horas</li>
        <li>Se você não solicitou esta recuperação, ignore este email</li>
        <li>Nunca compartilhe este link com outras pessoas</li>
      </ul>
    </div>
  </div>
</body>
</html>
```

### Exemplo Texto Plano

```
Recuperação de Senha

Olá,

Você solicitou a recuperação de senha para sua conta.

Acesse este link para redefinir sua senha:
http://localhost:8080/recover-password/${TOKEN}

IMPORTANTE:
- Este link expira em 24 horas
- Se você não solicitou esta recuperação, ignore este email
- Nunca compartilhe este link com outras pessoas

Equipe Controle Financeiro Familiar
```

## 🧪 Testes

### Teste Manual - Fluxo Completo

1. **Solicitar Recuperação**
   ```bash
   curl -X POST http://localhost:8080/auth/recover-token \
     -H "Content-Type: application/json" \
     -d '{"email":"usuario@example.com"}'
   ```

2. **Verificar Email**
   - Abrir caixa de entrada
   - Confirmar recebimento
   - Copiar token do link

3. **Resetar Senha via UI**
   - Acessar `http://localhost:8080/recover-password/{TOKEN}`
   - Preencher nova senha
   - Confirmar senha
   - Clicar em "Alterar Senha"

4. **Verificar Sucesso**
   - Tela de sucesso deve aparecer
   - Redirecionamento para login
   - Fazer login com nova senha

### Teste Manual - API Direta

```bash
# 1. Solicitar token
curl -X POST http://localhost:8080/auth/recover-token \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@example.com"}'

# 2. Resetar senha (substitua TOKEN pelo recebido no email)
curl -X PUT http://localhost:8080/auth/new-password \
  -H "Content-Type: application/json" \
  -d '{
    "token":"4813524e-ec0e-437a-8b41-e4476f77d684",
    "password":"novaSenha123"
  }'

# 3. Fazer login com nova senha
curl -X POST http://localhost:8080/oauth2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Authorization: Basic $(echo -n 'myclientid:myclientsecret' | base64)" \
  -d "grant_type=password&username=usuario&password=novaSenha123"
```

### Casos de Teste

| Cenário | Entrada | Resultado Esperado |
|---------|---------|-------------------|
| Email válido cadastrado | usuario@example.com | Email enviado com sucesso |
| Email não cadastrado | naoexiste@example.com | Mensagem genérica (segurança) |
| Email inválido | email-invalido | Erro de validação |
| Email vazio | "" | Erro "Digite seu email" |
| Token válido | UUID correto | Senha alterada |
| Token expirado | UUID antigo | Erro "Token expirado" |
| Token inválido | UUID errado | Erro "Token inválido" |
| Token já usado | UUID usado | Erro "Token já utilizado" |
| Senha < 6 caracteres | "123" | Erro "Mínimo 6 caracteres" |
| Senhas não coincidem | senha1 ≠ senha2 | Erro "Senhas não coincidem" |

## 🐛 Troubleshooting

### Email não chega

**Verificações:**
1. ✅ Email existe no sistema?
2. ✅ SMTP configurado no Spring Boot?
3. ✅ Conferiu pasta de spam?
4. ✅ Logs do backend mostram envio?
5. ✅ Email correto digitado?

### Token inválido

**Causa:**
O backend retornou erro ao validar o token.

**Verificações no Backend:**
1. ✅ Token existe no banco de dados?
2. ✅ Token não expirou (< 24h)?
3. ✅ Token não foi usado antes?
4. ✅ Token está associado a um usuário válido?

**Verificações no Frontend:**
1. ✅ Link completo foi copiado?
2. ✅ Token foi extraído corretamente da URL?

⚠️ **IMPORTANTE:** O frontend não valida o token. Se o erro ocorre, é porque o **backend** rejeitou o token.

### Tela não carrega

**Verificações:**
1. ✅ URL no formato `/recover-password/{token}`?
2. ✅ Frontend rodando na porta correta?
3. ✅ JavaScript habilitado no navegador?
4. ✅ Console do navegador mostra erros?

## 📊 Estatísticas Recomendadas

Para monitoramento da funcionalidade:

- Taxa de sucesso de recuperação
- Tempo médio entre solicitação e reset
- Tokens expirados vs usados
- Tentativas com email inexistente
- Erros de validação de senha

## 🔄 Próximas Melhorias

- [ ] Limite de tentativas por IP
- [ ] Captcha para prevenir abuse
- [ ] Notificação de alteração de senha bem-sucedida
- [ ] Histórico de recuperações no perfil do usuário
- [ ] Opção de recuperação por SMS
- [ ] Perguntas de segurança como alternativa

## 📚 Referências

- [OAuth2 RFC](https://tools.ietf.org/html/rfc6749)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)

---

**Versão:** 2.3  
**Data:** 30 de Outubro de 2025  
**Autor:** Sistema de Controle Financeiro Familiar
