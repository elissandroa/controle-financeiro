# Guia de Debugging - Login OAuth2

## 🔑 Recuperação de Senha

### Problema: Não recebi o email de recuperação

**Possíveis causas:**
1. Email digitado incorretamente
2. Email não cadastrado no sistema
3. Servidor de email não configurado no backend
4. Email na pasta de spam

**Soluções:**
1. Verifique a ortografia do email
2. Confirme que o email está cadastrado
3. Verifique configurações SMTP do Spring Boot
4. Confira a pasta de spam/lixo eletrônico
5. Aguarde alguns minutos (pode haver delay)

**Configuração Backend (application.properties):**
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=seu-email@gmail.com
spring.mail.password=sua-senha-app
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

---

### Problema: Link do email não abre a tela de reset

**Sintoma:**
Ao clicar no link do email, não carrega a tela de troca de senha.

**Causas Possíveis:**

#### 1. Link aponta para porta errada
O link está apontando para a porta do **backend** (8080) ao invés do **frontend** (5173/3000).

**Solução:**
1. O backend deve ser configurado para gerar links apontando para o frontend:
   ```java
   // application.properties
   frontend.url=http://localhost:5173
   
   // Código
   String link = frontendUrl + "/recover-password/" + token;
   ```

2. Verificar qual porta o frontend está rodando:
   ```bash
   # Geralmente é 5173 (Vite) ou 3000 (Create React App)
   npm run dev
   # Saída: Local: http://localhost:5173/
   ```

3. Link correto deve ser:
   - ❌ `http://localhost:8080/recover-password/token` (backend)
   - ✅ `http://localhost:5173/recover-password/token` (frontend)

**Teste Manual:**
Abra no navegador (testando diferentes formatos de URL):
```bash
# Formato correto (uma barra)
http://localhost:5173/recover-password/4813524e-ec0e-437a-8b41-e4476f77d684

# Também aceito (duas barras - backend pode gerar assim)
http://localhost:5173/recover-password//4813524e-ec0e-437a-8b41-e4476f77d684
```

Se a tela de reset carregar, o roteamento frontend está OK. O problema está no backend gerando o link errado.

#### 2. Link tem barras duplicadas

**Sintoma:**
Link tem formato `/recover-password//token` (duas barras).

**Causa:**
Backend está concatenando URLs incorretamente:
```java
// ❌ Gera barras duplicadas
String link = frontendUrl + "/recover-password/" + token;
// Se frontendUrl = "http://localhost:5173/" (com barra no final)
// Resultado: http://localhost:5173//recover-password/token

// ✅ Correto - remove barra final
String baseUrl = frontendUrl.replaceAll("/$", "");
String link = baseUrl + "/recover-password/" + token;
```

**Solução:**
O frontend **já aceita** links com barras duplicadas (regex atualizado), mas é melhor corrigir no backend.

**Debug no Console:**
Abra DevTools (F12) → Console e veja:
```
[App] Pathname atual: /recover-password//176bc467-805d-48b3-b722-2d7eb5f2ef0c
[App] Token de recuperação detectado: 176bc467-805d-48b3-b722-2d7eb5f2ef0c
[ResetPasswordScreen] Componente renderizado com token: 176bc467-805d-48b3-b722-2d7eb5f2ef0c
```

Se você vê essas mensagens, o frontend está funcionando corretamente!

---

### Problema: "Token inválido ou expirado"

**Sintoma:**
Ao tentar resetar senha, aparece erro de token inválido.

**Causa:**
O **backend** rejeitou o token. Possíveis motivos:
1. Token expirou (> 24-48h)
2. Token já foi usado anteriormente
3. Token não existe no banco de dados
4. Token foi copiado incorretamente

**⚠️ IMPORTANTE:** O frontend **não** valida o token. Esta validação é responsabilidade do backend.

**Soluções:**
1. Solicite novo email de recuperação
2. Copie o link completo do email
3. Use o link diretamente (clique no email)
4. Verifique logs do backend para detalhes

**O que o backend deve validar:**
- ✅ Token existe no banco
- ✅ Token não expirou
- ✅ Token não foi usado
- ✅ Token pertence a usuário válido

**Recomendação de implementação no backend:**
- Tokens devem expirar em 24-48 horas
- Tokens devem ser invalidados após uso
- Retornar mensagem clara: "Token inválido ou expirado"

---

### Problema: Link de recuperação não abre a tela

**Sintoma:**
Ao clicar no link do email, a tela de reset não carrega.

**Soluções:**
1. Verifique se a URL está no formato correto:
   ```
   http://localhost:8080/recover-password/4813524e-ec0e-437a-8b41-e4476f77d684
   ```
2. Se o frontend estiver em porta diferente, ajuste a URL:
   ```
   http://localhost:5173/recover-password/4813524e-ec0e-437a-8b41-e4476f77d684
   ```
3. Verifique se o App.tsx está processando a rota corretamente
4. Abra o console do navegador para ver erros

---

### Teste Manual de Recuperação

#### 1. Solicitar Token
```bash
curl -X POST http://localhost:8080/auth/recover-token \
  -H "Content-Type: application/json" \
  -d '{
    "to":"usuario@example.com",
    "subject":"Recuperação de Senha",
    "body":"Recuperação de Senha você tem 30 minutos para utilizar o token contido nesse email:"
  }'
```

**Resposta esperada:**
```json
{
  "message": "Email de recuperação enviado"
}
```

#### 2. Resetar Senha (com token do email)
```bash
curl -X PUT http://localhost:8080/auth/new-password \
  -H "Content-Type: application/json" \
  -d '{
    "token":"4813524e-ec0e-437a-8b41-e4476f77d684",
    "password":"novaSenha123"
  }'
```

**Resposta esperada:**
```json
{
  "message": "Senha alterada com sucesso"
}
```

---

## 🔴 Erros Comuns da API de Usuários

### Erro: "rawPassword cannot be null"

**Sintoma:**
```json
{
  "timestamp": "2025-10-30T00:08:22.963632100Z",
  "status": 400,
  "error": "Illegal argument",
  "message": "rawPassword cannot be null",
  "path": "/users"
}
```

**Causa:**
O campo `Password` está sendo enviado como `null` ou string vazia no update de usuário.

**Solução:**
1. **NÃO envie o campo `Password`** se não quiser alterar a senha
2. O frontend já está configurado para remover campos vazios automaticamente
3. Certifique-se de estar usando a versão 2.2 ou superior do código

**Correção Implementada:**
O código já remove automaticamente campos vazios:
```typescript
// UsersManagement.tsx
const userData: any = {
  firstName: formData.firstName.trim(),
  lastName: formData.lastName.trim(),
  email: formData.email.trim(),
  phone: formData.phone.trim() || undefined,
  roles: formData.selectedRoles.map(id => ({ id })),
};

// Só inclui password se foi fornecida
if (formData.password && formData.password.trim() !== '') {
  userData.password = formData.password.trim();
}
```

**Se o erro persistir:**
1. Limpe o cache do navegador (Ctrl+Shift+Delete)
2. Recarregue a página (Ctrl+F5)
3. Verifique o console do navegador para ver o body sendo enviado
4. Use a aba Network do DevTools para inspecionar a requisição

---

## Problema: Login não está funcionando

### 1. Verificar se a API está rodando

Abra o terminal e execute:

```bash
curl http://localhost:8080
```

**Resultado esperado:** Alguma resposta do servidor (mesmo que seja erro 404)

**Se não responder:** Inicie o backend Spring Boot

---

### 2. Testar o endpoint OAuth2 diretamente

#### Usando curl:

```bash
curl -X POST http://localhost:8080/oauth2/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -H "Authorization: Basic $(echo -n 'myclientid:myclientsecret' | base64)" \
  -d "grant_type=password&username=SEU_USUARIO&password=SUA_SENHA"
```

**Substitua:**
- `SEU_USUARIO` pelo username configurado no backend
- `SUA_SENHA` pela senha configurada no backend

#### Usando Postman:

1. **Method:** POST
2. **URL:** `http://localhost:8080/oauth2/token`
3. **Headers:**
   - `Content-Type: application/x-www-form-urlencoded`
4. **Authorization:**
   - Type: Basic Auth
   - Username: `myclientid`
   - Password: `myclientsecret`
5. **Body (x-www-form-urlencoded):**
   - `grant_type`: `password`
   - `username`: `SEU_USUARIO`
   - `password`: `SUA_SENHA`

**Resultado esperado:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 86400
}
```

---

### 3. Verificar Console do Navegador

Abra o DevTools (F12) > Console e tente fazer login. Você deve ver:

```
🔐 [Auth] Iniciando login... {username: "usuario", endpoint: "http://localhost:8080/oauth2/token"}
🔐 [Auth] Body da requisição: grant_type=password&username=usuario&password=...
🔐 [Auth] Status da resposta: 200
✅ [Auth] Login realizado com sucesso {token_type: "Bearer", expires_in: 86400}
🔐 [LoginScreen] Tentando fazer login com: usuario
✅ [LoginScreen] Login bem-sucedido, redirecionando...
```

---

### 4. Verificar Headers da Requisição

No DevTools > Network, procure pela requisição para `/oauth2/token`:

**Request Headers:**
```
POST /oauth2/token HTTP/1.1
Host: localhost:8080
Content-Type: application/x-www-form-urlencoded
Authorization: Basic bXljbGllbnRpZDpteWNsaWVudHNlY3JldA==
```

**Request Payload:**
```
grant_type=password&username=usuario&password=senha
```

---

### 5. Erros Comuns

#### Erro 401 Unauthorized

**Possíveis causas:**
- Username ou password incorretos
- Client ID ou Client Secret incorretos
- Usuário não existe no backend

**Solução:**
- Verifique as credenciais no backend
- Confirme que o usuário está cadastrado
- Verifique os valores de `CLIENT_ID` e `CLIENT_SECRET` em `auth-service.ts`

---

#### Erro 404 Not Found

**Possíveis causas:**
- Endpoint incorreto (deve ser `/oauth2/token`)
- API não está configurada para OAuth2

**Solução:**
- Confirme que o endpoint é `/oauth2/token` (não `/oauth/token`)
- Verifique a configuração OAuth2 no Spring Boot

---

#### Erro CORS

**Console mostra:**
```
Access to fetch at 'http://localhost:8080/oauth2/token' from origin 'http://localhost:5173' 
has been blocked by CORS policy
```

**Solução:**
Configure CORS no Spring Boot:

```java
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
```

---

#### Erro Network Failed

**Console mostra:**
```
❌ [Auth] Erro ao fazer login: TypeError: Failed to fetch
```

**Possíveis causas:**
- Backend não está rodando
- Firewall bloqueando a conexão
- URL incorreta

**Solução:**
- Inicie o backend Spring Boot
- Verifique se está em `http://localhost:8080`
- Desabilite firewall temporariamente para testar

---

### 6. Verificar SessionStorage

Após login bem-sucedido, verifique se o token foi armazenado:

DevTools > Application > Session Storage > `http://localhost:5173`

**Deve conter:**
- `auth_token`: O JWT token
- `auth_expires_at`: Timestamp de expiração

---

### 7. Testar Manualmente no Console

Abra o Console do navegador e execute:

```javascript
// Teste direto da função de login
const { login } = await import('./components/auth-service');

const result = await login({
  username: 'SEU_USUARIO',
  password: 'SUA_SENHA'
});

console.log('Login resultado:', result);
```

---

### 8. Verificar Configuração do Backend

#### application.properties

```properties
security.client-id=myclientid
security.client-secret=myclientsecret
security.jwt.duration=86400
```

#### Endpoint OAuth2

Certifique-se de que o Spring Boot tem:
- Spring Security OAuth2 configurado
- Password Grant Type habilitado
- Endpoint `/oauth2/token` acessível

---

### 9. Exemplo de Requisição HTTP Completa

```http
POST /oauth2/token HTTP/1.1
Host: localhost:8080
Content-Type: application/x-www-form-urlencoded
Authorization: Basic bXljbGllbnRpZDpteWNsaWVudHNlY3JldA==

grant_type=password&username=usuario&password=senha123
```

**Decodificado Authorization header:**
```
myclientid:myclientsecret (base64 encoded)
```

---

### 10. Checklist Final

- [ ] Backend Spring Boot está rodando em `http://localhost:8080`
- [ ] Endpoint `/oauth2/token` está acessível
- [ ] CORS está configurado para `http://localhost:5173`
- [ ] Client ID = `myclientid`
- [ ] Client Secret = `myclientsecret`
- [ ] Usuário existe no banco de dados
- [ ] Senha do usuário está correta
- [ ] Console do navegador não mostra erros CORS
- [ ] Console do navegador mostra os logs de autenticação
- [ ] SessionStorage contém o token após login

---

## Logs Detalhados

### Login Bem-Sucedido

```
🔐 [Auth] Iniciando login... {username: "admin", endpoint: "http://localhost:8080/oauth2/token"}
🔐 [Auth] Body da requisição: grant_type=password&username=admin&password=admin123
🔐 [Auth] Status da resposta: 200
✅ [Auth] Login realizado com sucesso {token_type: "Bearer", expires_in: 86400}
🔐 [LoginScreen] Tentando fazer login com: admin
✅ [LoginScreen] Login bem-sucedido, redirecionando...
```

### Login com Credenciais Inválidas

```
🔐 [Auth] Iniciando login... {username: "admin", endpoint: "http://localhost:8080/oauth2/token"}
🔐 [Auth] Body da requisição: grant_type=password&username=admin&password=wrongpass
🔐 [Auth] Status da resposta: 401
❌ [Auth] Erro no login: {status: 401, statusText: "Unauthorized", error: "Bad credentials"}
❌ [LoginScreen] Login falhou - credenciais inválidas
```

### Login com Backend Offline

```
🔐 [Auth] Iniciando login... {username: "admin", endpoint: "http://localhost:8080/oauth2/token"}
❌ [Auth] Erro ao fazer login: TypeError: Failed to fetch
❌ [LoginScreen] Erro ao fazer login: TypeError: Failed to fetch
```

---

## Comandos Úteis

### Verificar se a porta 8080 está em uso

**Linux/Mac:**
```bash
lsof -i :8080
```

**Windows:**
```cmd
netstat -ano | findstr :8080
```

### Testar conectividade

```bash
curl -v http://localhost:8080/oauth2/token
```

### Ver logs do Spring Boot

Se estiver usando terminal, os logs devem aparecer automaticamente.

---

## Contato

Se após seguir todos os passos o problema persistir:

1. Capture os logs completos do console
2. Capture a requisição completa do Network tab
3. Capture os logs do backend Spring Boot
4. Verifique a configuração OAuth2 do Spring Boot
