# 🧪 Guia de Teste - Recuperação de Senha

## ✅ Teste Rápido do Frontend

### 1. Abrir Console do Navegador

Pressione **F12** → Aba **Console**

### 2. Testar Links Diretamente

Cole no navegador (um de cada vez):

```
http://localhost:3000/recover-password/176bc467-805d-48b3-b722-2d7eb5f2ef0c
```

**OU** (se o backend gerar com duas barras):

```
http://localhost:3000/recover-password//176bc467-805d-48b3-b722-2d7eb5f2ef0c
```

### 3. O Que Você Deve Ver

#### ✅ Sucesso

**No navegador:**
- Tela de "Redefinir Senha" com:
  - Campo "Nova Senha"
  - Campo "Confirmar Senha"
  - Botão "Alterar Senha"
  - Botão "Voltar ao Login"

**No console (F12):**
```
[App] Pathname atual: /recover-password/176bc467-805d-48b3-b722-2d7eb5f2ef0c
[App] Token de recuperação detectado: 176bc467-805d-48b3-b722-2d7eb5f2ef0c
[ResetPasswordScreen] Componente renderizado com token: 176bc467-805d-48b3-b722-2d7eb5f2ef0c
```

#### ❌ Erro

**Sintoma:** Redireciona para tela de login

**No console:**
```
[App] Pathname atual: /recover-password/176bc467-805d-48b3-b722-2d7eb5f2ef0c
[App] Usuário autenticado? false
```

**Causa:** O regex não está capturando o token.

**Solução:** Verificar se o App.tsx tem o regex correto (v2.3.4):
```typescript
const resetMatch = path.match(/\/recover-password\/+([a-f0-9-]+)/i);
```

---

## 📝 Teste Completo do Fluxo

### Passo 1: Solicitar Recuperação

1. Abra `http://localhost:3000`
2. Clique em "Esqueci minha senha"
3. Digite um email cadastrado
4. Clique em "Enviar"
5. **Espere:** Mensagem de sucesso

### Passo 2: Verificar Email

**O que verificar:**
- ✅ Email foi enviado
- ✅ Assunto: "Recuperação de Senha"
- ✅ Link presente no corpo do email
- ✅ Link aponta para porta do frontend (3000 ou 5173)

**Formatos aceitos:**
```
✅ http://localhost:3000/recover-password/token
✅ http://localhost:3000/recover-password//token (tolerado)
❌ http://localhost:8080/recover-password/token (backend)
```

### Passo 3: Clicar no Link

1. Abra o email
2. Clique no link de recuperação
3. **Deve abrir:** Tela de reset de senha
4. **Não deve:** Ir para tela de login

### Passo 4: Resetar Senha

1. Digite nova senha (mínimo 6 caracteres)
2. Confirme a senha
3. Clique em "Alterar Senha"
4. **Espere:** Backend validar o token

#### Possíveis Resultados

**✅ Sucesso:**
```
Toast verde: "Senha alterada com sucesso!"
Tela muda para: Confirmação com ícone verde
Após 2 segundos: Redireciona para login
```

**❌ Token Inválido:**
```
Toast vermelho: "Token inválido ou expirado"
Permanece na tela de reset
```

**Causas possíveis:**
- Token não existe no banco
- Token expirou (>30 minutos)
- Token já foi usado
- Backend não está validando corretamente

### Passo 5: Fazer Login

1. Digite email
2. Digite a **nova senha**
3. Clique em "Entrar"
4. **Deve funcionar!**

---

## 🔍 Debug Detalhado

### Verificar Roteamento Frontend

**Teste 1: Token com uma barra**
```
http://localhost:3000/recover-password/test-token-123
```

**Console esperado:**
```
[App] Pathname atual: /recover-password/test-token-123
[App] Token de recuperação detectado: test-token-123
```

**Teste 2: Token com duas barras**
```
http://localhost:3000/recover-password//test-token-123
```

**Console esperado:**
```
[App] Pathname atual: /recover-password//test-token-123
[App] Token de recuperação detectado: test-token-123
```

Se os dois funcionarem → **Regex OK!**

### Verificar Envio para Backend

Abra DevTools → Aba **Network**

1. Digite senha e confirme
2. Clique em "Alterar Senha"
3. Verifique a requisição:

**Request:**
```
PUT http://localhost:8080/auth/new-password
Content-Type: application/json

{
  "token": "176bc467-805d-48b3-b722-2d7eb5f2ef0c",
  "newPassword": "novaSenha123"
}
```

**Response (Sucesso):**
```json
{
  "message": "Senha alterada com sucesso"
}
```

**Response (Erro - Token Inválido):**
```json
{
  "message": "Token inválido ou expirado"
}
```

**Response (Erro - Token Usado):**
```json
{
  "message": "Token já utilizado"
}
```

---

## 🐛 Troubleshooting

### Problema: Sempre redireciona para login

**Verificar:**
1. Console mostra logs do App.tsx?
   - Se não → Adicionar `console.log` está faltando
2. Regex está correto?
   - Deve ser: `/\/recover-password\/+([a-f0-9-]+)/i`
   - Não pode ser: `/\/recover-password\/([a-f0-9-]+)/i` (sem `+`)
3. Token tem formato correto?
   - UUID válido: `176bc467-805d-48b3-b722-2d7eb5f2ef0c`
   - Apenas letras minúsculas `a-f`, números `0-9` e hífens `-`

### Problema: Token sempre inválido

**Verificar no Backend:**
1. Token está sendo salvo no banco?
   ```sql
   SELECT * FROM password_reset_tokens 
   WHERE token = '176bc467-805d-48b3-b722-2d7eb5f2ef0c';
   ```

2. Expiração está correta?
   ```sql
   SELECT token, expires_at, NOW() as agora, used
   FROM password_reset_tokens 
   WHERE token = '176bc467-805d-48b3-b722-2d7eb5f2ef0c';
   ```

3. Token não está marcado como usado?
   ```sql
   -- Deve ser false/0
   SELECT used FROM password_reset_tokens 
   WHERE token = '176bc467-805d-48b3-b722-2d7eb5f2ef0c';
   ```

### Problema: Link tem 3+ barras

**Exemplo:**
```
http://localhost:3000///recover-password/token
```

**Causa:** Backend está concatenando errado.

**Solução no Backend:**
```java
// Normalizar URL
String baseUrl = frontendUrl
    .replaceAll("/$", "")           // Remove barra final
    .replaceAll("/+", "/");         // Remove barras duplicadas
String link = baseUrl + "/recover-password/" + token;
```

---

## ✅ Checklist de Validação

### Frontend
- [ ] Regex aceita 1 barra: `/recover-password/token`
- [ ] Regex aceita 2+ barras: `/recover-password//token`
- [ ] Console mostra logs de debug
- [ ] Tela de reset renderiza corretamente
- [ ] Campos de senha funcionam
- [ ] Botão "Alterar Senha" envia requisição
- [ ] Toast de sucesso aparece
- [ ] Redireciona para login após sucesso

### Backend
- [ ] Endpoint POST /auth/recover-token funciona
- [ ] Email é enviado
- [ ] Link aponta para frontend (porta 3000 ou 5173)
- [ ] Link não tem barras duplicadas (ideal)
- [ ] Token é salvo no banco
- [ ] Expiração é 30 minutos
- [ ] Endpoint PUT /auth/new-password funciona
- [ ] Token válido altera senha
- [ ] Token inválido retorna erro 400
- [ ] Token usado não pode ser reutilizado

### Integração
- [ ] Fluxo completo funciona end-to-end
- [ ] Email → Link → Tela → Alterar → Login
- [ ] Senha antiga não funciona mais
- [ ] Senha nova funciona

---

## 📊 Exemplos de URLs

### ✅ Funcionam

```
http://localhost:3000/recover-password/176bc467-805d-48b3-b722-2d7eb5f2ef0c
http://localhost:3000/recover-password//176bc467-805d-48b3-b722-2d7eb5f2ef0c
http://localhost:5173/recover-password/abc123-def456-789
http://localhost:5173/recover-password//abc123-def456-789
```

### ❌ Não Funcionam

```
# Porta errada (backend)
http://localhost:8080/recover-password/token

# Token inválido (letras maiúsculas, caracteres especiais)
http://localhost:3000/recover-password/ABC123-DEF456
http://localhost:3000/recover-password/token23

# Path errado
http://localhost:3000/reset-password/token
http://localhost:3000/recover/token
```

---

## 📞 Suporte

Se após seguir este guia o problema persistir:

1. **Copie os logs do console** (F12 → Console)
2. **Copie a URL exata** que você está tentando acessar
3. **Copie a resposta do backend** (Network → Resposta da API)
4. **Informe qual passo falhou** neste guia

**Versão:** 2.3.4  
**Data:** 30 de Outubro de 2025  
**Status:** ✅ Atualizado
