# ⚙️ Setup do Backend - Recuperação de Senha

## 🚨 Problema Comum

**Sintoma:** Link do email não abre a tela de reset de senha.

**Causa:** Link aponta para `http://localhost:8080` (backend) ao invés de `http://localhost:5173` (frontend).

**Solução:** Configurar o backend para gerar links apontando para o frontend.

---

## ✅ Configuração Passo a Passo

### 1. Adicionar Variável de Ambiente

**application.properties:**
```properties
# URL do Frontend
frontend.url=http://localhost:5173

# Em produção:
# frontend.url=https://seu-dominio.com
```

**OU application.yml:**
```yaml
frontend:
  url: http://localhost:5173
  
# Em produção:
# frontend:
#   url: https://seu-dominio.com
```

### 2. Criar/Atualizar o Service

```java
package com.example.financeiro.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.UUID;
import java.time.LocalDateTime;

@Service
public class PasswordRecoveryService {
    
    // Injetar URL do frontend
    @Value("${frontend.url}")
    private String frontendUrl;
    
    @Autowired
    private PasswordResetTokenRepository tokenRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private EmailService emailService;
    
    /**
     * Processa requisição de recuperação de senha
     * 
     * @param request { to, subject, body }
     * @return mensagem de sucesso
     */
    public Map<String, String> requestRecovery(EmailRecoveryRequest request) {
        String email = request.getTo();
        
        // Validar se usuário existe
        User user = userRepository.findByEmail(email)
            .orElse(null);
        
        // Não revelar se email existe (segurança)
        if (user == null) {
            log.warn("Tentativa de recuperação com email inexistente: {}", email);
            return Map.of("message", "Email de recuperação enviado");
        }
        
        // Gerar token UUID único
        String token = UUID.randomUUID().toString();
        
        // Salvar token no banco (expira em 30 minutos)
        PasswordResetToken resetToken = new PasswordResetToken();
        resetToken.setToken(token);
        resetToken.setUser(user);
        resetToken.setExpiresAt(LocalDateTime.now().plusMinutes(30));
        resetToken.setUsed(false);
        tokenRepository.save(resetToken);
        
        // ✅ CRÍTICO: Gerar link apontando para o FRONTEND
        // Remove barra final da URL para evitar barras duplicadas
        String baseUrl = frontendUrl.replaceAll("/$", "");
        String recoveryLink = baseUrl + "/recover-password/" + token;
        
        // Montar corpo do email com o link
        String emailBody = request.getBody() + "\n\n" + recoveryLink;
        
        // Enviar email
        emailService.send(
            request.getTo(),
            request.getSubject(),
            emailBody
        );
        
        log.info("Email de recuperação enviado para: {}", email);
        return Map.of("message", "Email de recuperação enviado");
    }
    
    /**
     * Reseta a senha do usuário
     * 
     * @param token Token de recuperação
     * @param newPassword Nova senha
     * @return mensagem de sucesso
     */
    public Map<String, String> resetPassword(String token, String newPassword) {
        // Validar token existe
        PasswordResetToken resetToken = tokenRepository.findByToken(token)
            .orElseThrow(() -> new InvalidTokenException("Token inválido"));
        
        // Validar não expirou
        if (resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Token expirado");
        }
        
        // Validar não foi usado
        if (resetToken.isUsed()) {
            throw new InvalidTokenException("Token já utilizado");
        }
        
        // Alterar senha
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Invalidar token (uso único)
        resetToken.setUsed(true);
        resetToken.setUsedAt(LocalDateTime.now());
        tokenRepository.save(resetToken);
        
        log.info("Senha alterada com sucesso para usuário: {}", user.getEmail());
        return Map.of("message", "Senha alterada com sucesso");
    }
}
```

### 3. DTO para Request

```java
package com.example.financeiro.dto;

import lombok.Data;

@Data
public class EmailRecoveryRequest {
    private String to;      // Email do usuário
    private String subject; // Assunto do email
    private String body;    // Corpo do email (sem o link)
}

@Data
public class ResetPasswordRequest {
    private String token;       // Token UUID de recuperação
    private String newPassword; // Nova senha do usuário
}
```

### 4. Controller

```java
package com.example.financeiro.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {
    
    @Autowired
    private PasswordRecoveryService recoveryService;
    
    /**
     * POST /auth/recover-token
     * 
     * Body: { "to": "email@example.com", "subject": "...", "body": "..." }
     */
    @PostMapping("/recover-token")
    public ResponseEntity<?> recoverToken(@RequestBody EmailRecoveryRequest request) {
        try {
            Map<String, String> response = recoveryService.requestRecovery(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Erro ao processar recuperação de senha", e);
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erro ao processar solicitação"));
        }
    }
    
    /**
     * PUT /auth/new-password
     * 
     * Body: { "token": "uuid-token", "newPassword": "novaSenha123" }
     */
    @PutMapping("/new-password")
    public ResponseEntity<?> newPassword(@RequestBody ResetPasswordRequest request) {
        try {
            Map<String, String> response = recoveryService.resetPassword(
                request.getToken(),
                request.getNewPassword() // Corrigido: getNewPassword() ao invés de getPassword()
            );
            return ResponseEntity.ok(response);
        } catch (InvalidTokenException e) {
            return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Erro ao resetar senha", e);
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Erro ao processar solicitação"));
        }
    }
}
```

### 5. Entidade do Token

```java
package com.example.financeiro.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_tokens")
@Data
public class PasswordResetToken {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String token;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(nullable = false)
    private LocalDateTime expiresAt;
    
    @Column(nullable = false)
    private Boolean used = false;
    
    private LocalDateTime usedAt;
    
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
```

### 6. Repository

```java
package com.example.financeiro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);
}
```

---

## 🧪 Teste Manual

### 1. Verificar Configuração

```bash
# Verificar se frontend.url está configurado
grep "frontend.url" src/main/resources/application.properties
# Deve retornar: frontend.url=http://localhost:5173
```

### 2. Iniciar Aplicações

```bash
# Terminal 1 - Backend
./mvnw spring-boot:run
# Deve rodar em http://localhost:8080

# Terminal 2 - Frontend
cd frontend
npm run dev
# Deve rodar em http://localhost:5173
```

### 3. Testar Endpoint

```bash
curl -X POST http://localhost:8080/auth/recover-token \
  -H "Content-Type: application/json" \
  -d '{
    "to": "usuario@example.com",
    "subject": "Recuperação de Senha",
    "body": "Recuperação de Senha você tem 30 minutos para utilizar o token contido nesse email:"
  }'
```

**Resposta esperada:**
```json
{
  "message": "Email de recuperação enviado"
}
```

### 4. Verificar Email

Verifique se o email contém um link no formato:
```
http://localhost:5173/recover-password/{token-uuid}
         ↑
    Deve ser 5173, NÃO 8080!
```

### 5. Testar Link

1. Copie o link do email
2. Cole no navegador
3. **Deve abrir:** Tela React de reset de senha
4. **NÃO deve:** Mostrar erro 404 ou página em branco

---

## 🔍 Troubleshooting

### Link aponta para 8080

**Problema:**
```
http://localhost:8080/recover-password/token
                ↑ Errado!
```

**Solução:**
1. Verificar se `frontend.url` está no application.properties
2. Verificar se `@Value("${frontend.url}")` está injetado
3. Verificar se está usando `frontendUrl + "/recover-password/" + token`
4. Reiniciar o backend

### Link tem barras duplicadas

**Problema:**
```
http://localhost:5173//recover-password/token
                     ↑↑ Duas barras!
```

**Causa:**
O `frontend.url` tem barra final e o código adiciona outra:
```java
// Se frontendUrl = "http://localhost:5173/" (com barra)
String link = frontendUrl + "/recover-password/" + token;
// Resultado: http://localhost:5173//recover-password/token (duas barras)
```

**Solução:**
```java
// Remove barra final antes de concatenar
String baseUrl = frontendUrl.replaceAll("/$", "");
String link = baseUrl + "/recover-password/" + token;
// Resultado: http://localhost:5173/recover-password/token (OK!)
```

**Observação:** O frontend **já aceita** links com barras duplicadas (desde v2.3.3), mas é melhor gerar links corretos.

### Link não abre tela React

**Verificar:**
1. Frontend está rodando? `http://localhost:5173` deve estar acessível
2. Link está correto? Deve ser porta 5173
3. Token está na URL? Deve ter formato UUID

**Teste direto:**
```
http://localhost:5173/recover-password/4813524e-ec0e-437a-8b41-e4476f77d684
```

Se abrir a tela de reset → roteamento frontend OK, problema está no backend gerando link errado.

### Token sempre inválido

**Verificar:**
1. Token está sendo salvo no banco?
2. Expiração está sendo setada? (30 minutos)
3. Token não está sendo marcado como usado antes?

---

## 📋 Checklist de Implementação

### Configuração
- [ ] `frontend.url` adicionado no application.properties
- [ ] Porta correta (5173 em dev, domínio em prod)

### Código
- [ ] Service criado com `@Value("${frontend.url}")`
- [ ] Link gerado com `frontendUrl + "/recover-password/" + token`
- [ ] Token salvo no banco com expiração de 30min
- [ ] Validações implementadas (existe, expirou, usado)
- [ ] Token invalidado após uso

### Endpoints
- [ ] POST /auth/recover-token implementado
- [ ] PUT /auth/new-password implementado
- [ ] Retorna erros adequados (400 para token inválido)

### Testes
- [ ] Email enviado com link correto (porta 5173)
- [ ] Link abre tela React de reset
- [ ] Token válido permite trocar senha
- [ ] Token inválido retorna erro 400
- [ ] Token expira após 30 minutos
- [ ] Token só pode ser usado uma vez

---

## 🎯 Resumo

### Porta Correta

| Componente | Porta | Link de Recuperação? |
|------------|-------|---------------------|
| Backend | 8080 | ❌ NÃO |
| **Frontend** | **5173** | **✅ SIM** |

### Código Essencial

```java
@Value("${frontend.url}")  // http://localhost:5173
private String frontendUrl;

String link = frontendUrl + "/recover-password/" + token;
// Resultado: http://localhost:5173/recover-password/{token}
```

### Fluxo de Email

```
Frontend POST → Backend gera token → Backend monta link com frontendUrl
→ Backend envia email com link → Usuário clica → Abre tela React
```

---

**Versão:** 2.3.3  
**Data:** 30 de Outubro de 2025  
**Status:** ✅ Documentado
