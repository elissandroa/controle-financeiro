# 🗄️ Deploy do Backend - Guia Completo

Este guia explica como hospedar o backend Java Spring Boot em diferentes plataformas para funcionar com o frontend no GitHub Pages.

---

## 📋 Pré-requisitos

- [ ] Backend Java Spring Boot funcional
- [ ] Banco de dados configurado
- [ ] Git instalado
- [ ] Conta na plataforma escolhida (Heroku, Railway, Render, etc.)

---

## 🚀 Opções de Hospedagem

### Comparativo Rápido

| Plataforma | Gratuito | Fácil | Banco Incluso | Recomendação |
|------------|----------|-------|---------------|--------------|
| **Railway** | ✅ (trial) | ⭐⭐⭐⭐⭐ | ✅ | Melhor para começar |
| **Render** | ✅ | ⭐⭐⭐⭐ | ✅ | Ótima alternativa |
| **Heroku** | ❌* | ⭐⭐⭐⭐ | ✅ | Precisa cartão |
| **AWS/Azure** | ✅ (trial) | ⭐⭐ | ✅ | Mais complexo |

*Heroku removeu plano gratuito em 2022, mas ainda é popular.

---

## 1️⃣ Railway (Recomendado)

### Por que Railway?
- ✅ Deploy automático via GitHub
- ✅ $5 crédito grátis (sem cartão)
- ✅ PostgreSQL incluído
- ✅ Configuração muito simples
- ✅ HTTPS automático

### Passo a Passo

#### 1. Criar Conta

1. Acesse https://railway.app
2. Clique em **Login with GitHub**
3. Autorize o Railway

#### 2. Criar Novo Projeto

1. Clique em **New Project**
2. Selecione **Deploy from GitHub repo**
3. Conecte seu repositório do backend
4. Railway detecta automaticamente que é Java/Spring Boot

#### 3. Adicionar Banco de Dados

1. Clique em **+ New**
2. Selecione **Database** → **PostgreSQL**
3. Railway provisiona automaticamente

#### 4. Configurar Variáveis de Ambiente

No Railway, clique no serviço → **Variables**:

```bash
# Banco de dados (Railway gera automaticamente)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# Spring Boot
SPRING_PROFILES_ACTIVE=production
SERVER_PORT=8080

# Frontend URL (substitua com sua URL do GitHub Pages)
FRONTEND_URL=https://SEU-USUARIO.github.io/controle-financeiro-familiar

# OAuth2
CLIENT_ID=myclientid
CLIENT_SECRET=myclientsecret

# JWT
JWT_SECRET=SUA_CHAVE_SECRETA_AQUI_MIN_256_BITS

# Email (se usar recuperação de senha)
SPRING_MAIL_HOST=smtp.gmail.com
SPRING_MAIL_PORT=587
SPRING_MAIL_USERNAME=seu-email@gmail.com
SPRING_MAIL_PASSWORD=sua-senha-app
```

#### 5. Configurar application.properties

No seu backend, crie `application-production.properties`:

```properties
# Usar variáveis de ambiente
spring.datasource.url=${DATABASE_URL}
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# Frontend URL
frontend.url=${FRONTEND_URL}

# OAuth2
security.oauth2.client.client-id=${CLIENT_ID}
security.oauth2.client.client-secret=${CLIENT_SECRET}

# Server
server.port=${PORT:8080}

# CORS (configurado no código Java)
```

#### 6. Deploy

```bash
# Railway faz deploy automático ao dar push!
git add .
git commit -m "Configure for Railway"
git push origin main

# Railway detecta, faz build e deploy
# Aguarde 2-3 minutos
```

#### 7. Obter URL

1. No Railway, clique no serviço
2. Clique em **Settings** → **Generate Domain**
3. Copie a URL: `https://seu-app.up.railway.app`

#### 8. Testar

```bash
curl https://seu-app.up.railway.app/actuator/health

# Deve retornar:
# {"status":"UP"}
```

---

## 2️⃣ Render

### Passo a Passo

#### 1. Criar Conta

1. Acesse https://render.com
2. Clique em **Get Started**
3. Login com GitHub

#### 2. Criar Web Service

1. Dashboard → **New** → **Web Service**
2. Conecte seu repositório do backend
3. Configure:
   - **Name:** controle-financeiro-backend
   - **Environment:** Docker ou Java (Render detecta)
   - **Build Command:** `./mvnw clean package -DskipTests`
   - **Start Command:** `java -jar target/seu-app.jar`

#### 3. Adicionar Banco de Dados

1. Dashboard → **New** → **PostgreSQL**
2. Nome: `controle-financeiro-db`
3. Plano: **Free**

#### 4. Conectar Banco ao Serviço

No Web Service → **Environment**:

```bash
DATABASE_URL=${{ controle-financeiro-db.DATABASE_URL }}
SPRING_PROFILES_ACTIVE=production
FRONTEND_URL=https://seu-usuario.github.io/controle-financeiro-familiar
```

#### 5. Deploy

Render faz deploy automático! Aguarde 5-10 minutos (primeira vez é mais lento).

---

## 3️⃣ Heroku

### Passo a Passo

#### 1. Instalar Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Baixe o instalador: https://devcenter.heroku.com/articles/heroku-cli

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

#### 2. Login

```bash
heroku login
```

#### 3. Criar Aplicação

```bash
cd seu-backend
heroku create nome-do-seu-app
```

#### 4. Adicionar PostgreSQL

```bash
heroku addons:create heroku-postgresql:mini
```

#### 5. Configurar Variáveis

```bash
heroku config:set SPRING_PROFILES_ACTIVE=production
heroku config:set FRONTEND_URL=https://seu-usuario.github.io/controle-financeiro-familiar
heroku config:set CLIENT_ID=myclientid
heroku config:set CLIENT_SECRET=myclientsecret
```

#### 6. Deploy

```bash
git push heroku main

# Aguarde build e deploy
# URL: https://nome-do-seu-app.herokuapp.com
```

---

## 🔧 Configuração do Backend para Produção

### 1. Atualizar CORS

```java
// SecurityConfig.java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    
    // Pegar frontend URL da variável de ambiente
    String frontendUrl = System.getenv("FRONTEND_URL");
    if (frontendUrl == null) {
        frontendUrl = "http://localhost:3000";
    }
    
    configuration.setAllowedOrigins(Arrays.asList(
        "http://localhost:3000",
        "http://localhost:5173",
        frontendUrl // URL do GitHub Pages
    ));
    
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

### 2. Configurar application-production.properties

```properties
# Banco de dados (usa variável de ambiente)
spring.datasource.url=${DATABASE_URL}
spring.jpa.hibernate.ddl-auto=update
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Não mostrar SQL em produção
spring.jpa.show-sql=false

# Server
server.port=${PORT:8080}

# Frontend URL
frontend.url=${FRONTEND_URL:http://localhost:3000}

# OAuth2
security.oauth2.client.client-id=${CLIENT_ID:myclientid}
security.oauth2.client.client-secret=${CLIENT_SECRET:myclientsecret}

# JWT
jwt.secret=${JWT_SECRET:default-secret-change-in-production}
jwt.expiration=86400000

# Email
spring.mail.host=${SPRING_MAIL_HOST:smtp.gmail.com}
spring.mail.port=${SPRING_MAIL_PORT:587}
spring.mail.username=${SPRING_MAIL_USERNAME}
spring.mail.password=${SPRING_MAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

### 3. Criar system.properties (Heroku)

```properties
java.runtime.version=17
```

### 4. Criar Procfile (Heroku)

```
web: java -Dserver.port=$PORT -Dspring.profiles.active=production -jar target/seu-app.jar
```

---

## ✅ Configurar Frontend com Backend Hospedado

### 1. No GitHub (Secrets)

1. Vá para o repositório → **Settings**
2. **Secrets and variables** → **Actions**
3. **New repository secret**
4. Adicione:
   - Nome: `VITE_API_BASE_URL`
   - Valor: `https://seu-backend.railway.app` (ou Heroku/Render)

### 2. Fazer Redeploy do Frontend

```bash
git commit --allow-empty -m "Update API URL"
git push origin main

# Deploy automático com nova URL
```

---

## 🧪 Testar Integração Completa

### 1. Testar Backend

```bash
# Health check
curl https://seu-backend.railway.app/actuator/health

# Testar login
curl -X POST https://seu-backend.railway.app/oauth2/token \
  -d "grant_type=password" \
  -d "username=admin" \
  -d "password=admin" \
  -d "client_id=myclientid" \
  -d "client_secret=myclientsecret"
```

### 2. Testar Frontend

1. Acesse: `https://seu-usuario.github.io/controle-financeiro-familiar/`
2. Abra DevTools (F12) → Console
3. Faça login
4. Verifique requisições na aba Network
5. Deve mostrar requisições para `seu-backend.railway.app`

---

## 🐛 Troubleshooting

### Backend não inicia

**Ver logs:**

```bash
# Railway
railway logs

# Heroku
heroku logs --tail

# Render
# Dashboard → Service → Logs
```

**Problemas comuns:**

1. **Porta errada**
   ```java
   // application.properties
   server.port=${PORT:8080}
   ```

2. **DATABASE_URL não configurada**
   ```bash
   railway variables
   ```

3. **Build falha**
   ```bash
   # Testar localmente
   ./mvnw clean package
   ```

---

### CORS Error

**Sintoma:**
```
Access to fetch at 'https://backend.railway.app/members' 
from origin 'https://usuario.github.io' has been blocked by CORS
```

**Solução:**

1. Verificar `FRONTEND_URL` no backend:
   ```bash
   railway variables
   # Deve ter: FRONTEND_URL=https://usuario.github.io/controle-financeiro-familiar
   ```

2. Verificar código CORS (veja seção anterior)

3. Redeploy do backend:
   ```bash
   git push origin main
   ```

---

### Email não envia

**Verificar:**

1. Variáveis de ambiente configuradas
2. Senha de app do Gmail (não senha normal)
3. "Acesso a apps menos seguros" desabilitado no Gmail

**Obter senha de app (Gmail):**

1. https://myaccount.google.com/security
2. Verificação em duas etapas → Ativada
3. Senhas de app → Gerar
4. Use essa senha no `SPRING_MAIL_PASSWORD`

---

## 📊 Monitoramento

### Railway

```bash
# Ver logs em tempo real
railway logs

# Ver status
railway status

# Ver variáveis
railway variables
```

### Heroku

```bash
# Logs
heroku logs --tail

# Abrir app
heroku open

# Escalar
heroku ps:scale web=1
```

### Render

- Dashboard → Service → Logs
- Metrics (CPU, Memory)
- Events (deploys)

---

## 💰 Custos Estimados

### Railway
- **Grátis:** $5 crédito mensal (~500h)
- **Hobby:** $5/mês (ilimitado)
- **Pro:** $20/mês

### Render
- **Free:** 750h/mês (suspende após inatividade)
- **Starter:** $7/mês

### Heroku
- **Eco:** $5/mês (1000h)
- **Basic:** $7/mês
- **Standard:** $25+/mês

---

## ✅ Checklist de Deploy

### Preparação
- [ ] Backend funciona localmente
- [ ] Testes passando
- [ ] `application-production.properties` criado
- [ ] CORS configurado com variável de ambiente
- [ ] Git inicializado

### Deploy
- [ ] Plataforma escolhida
- [ ] Repositório conectado
- [ ] Banco de dados provisionado
- [ ] Variáveis de ambiente configuradas
- [ ] Deploy realizado
- [ ] URL do backend obtida

### Integração
- [ ] `VITE_API_BASE_URL` configurada no GitHub
- [ ] Frontend redeployado
- [ ] CORS testado
- [ ] Login funcionando
- [ ] API respondendo

### Produção
- [ ] Health check OK
- [ ] Logs sem erros
- [ ] Email funcionando (se aplicável)
- [ ] Performance OK
- [ ] Monitoramento configurado

---

## 🎯 Exemplo Completo

### Arquitetura Final

```
┌─────────────────────┐
│  GitHub Pages       │
│  (Frontend React)   │
│  seu-usuario.github.io
└──────────┬──────────┘
           │ HTTPS
           │ CORS OK
           ▼
┌─────────────────────┐
│  Railway/Render     │
│  (Backend Spring)   │
│  backend.railway.app│
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  PostgreSQL         │
│  (Banco de Dados)   │
└─────────────────────┘
```

### URLs Finais

**Frontend:**
```
https://seu-usuario.github.io/controle-financeiro-familiar/
```

**Backend:**
```
https://seu-backend.railway.app
```

**Integração:**
```
Frontend → Backend → Database
  HTTPS      HTTPS      Internal
```

---

## 📚 Recursos

- [Railway Docs](https://docs.railway.app/)
- [Render Docs](https://render.com/docs)
- [Heroku Docs](https://devcenter.heroku.com/)
- [Spring Boot Deployment](https://spring.io/guides/gs/spring-boot/)

---

**Versão:** 2.4.0  
**Última atualização:** 30 de Outubro de 2025  
**Status:** ✅ Testado e funcionando
