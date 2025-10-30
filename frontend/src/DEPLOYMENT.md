# 🚀 Guia de Deploy - GitHub Pages

Este guia explica como publicar o aplicativo de Controle Financeiro Familiar no GitHub Pages.

---

## 📋 Pré-requisitos

- [x] Conta no GitHub
- [x] Repositório Git criado
- [x] Node.js instalado (v18 ou superior)
- [x] Backend Java Spring Boot hospedado (opcional para demo)

---

## 🔧 Configuração Inicial

### 1. Criar Repositório no GitHub

```bash
# No seu terminal, dentro da pasta do projeto:
git init
git add .
git commit -m "Initial commit: Controle Financeiro Familiar v2.3.5"
```

Vá para [GitHub](https://github.com/new) e crie um novo repositório chamado, por exemplo, `controle-financeiro-familiar`.

```bash
# Adicione o remote
git remote add origin https://github.com/SEU-USUARIO/controle-financeiro-familiar.git
git branch -M main
git push -u origin main
```

---

## ⚙️ Configuração do GitHub Pages

### 1. Habilitar GitHub Pages

1. Vá para o repositório no GitHub
2. Clique em **Settings** (Configurações)
3. No menu lateral, clique em **Pages**
4. Em **Source**, selecione:
   - Source: **GitHub Actions**

### 2. Configurar Variáveis de Ambiente (Opcional)

Se você tiver um backend hospedado:

1. Vá para **Settings** → **Secrets and variables** → **Actions**
2. Clique em **New repository secret**
3. Adicione:
   - **Nome:** `VITE_API_BASE_URL`
   - **Valor:** `https://seu-backend.herokuapp.com` (URL do seu backend)

Se não configurar, o app usará `http://localhost:8080` (modo desenvolvimento).

---

## 🚢 Deploy Automático

### Como Funciona

O deploy é **automático**! Sempre que você fizer push para a branch `main`, o GitHub Actions:

1. ✅ Instala as dependências
2. ✅ Faz build do projeto
3. ✅ Publica no GitHub Pages

### Fazer Deploy

```bash
# Faça qualquer alteração
git add .
git commit -m "Atualização do app"
git push origin main

# O deploy inicia automaticamente!
```

### Acompanhar o Deploy

1. Vá para a aba **Actions** no GitHub
2. Você verá o workflow **"Deploy to GitHub Pages"** rodando
3. Aguarde alguns minutos até ficar verde ✅

---

## 🌐 Acessar o Aplicativo

Após o deploy, seu app estará disponível em:

```
https://SEU-USUARIO.github.io/controle-financeiro-familiar/
```

**Exemplo:**
```
https://joaosilva.github.io/controle-financeiro-familiar/
```

---

## 🔐 Configuração do Backend

### Opção 1: Backend Local (Desenvolvimento)

Se você rodar o backend localmente, o app funcionará apenas no seu computador:

```bash
# Crie um arquivo .env na raiz do projeto
echo "VITE_API_BASE_URL=http://localhost:8080" > .env

# Rode o backend
cd backend
./mvnw spring-boot:run

# Em outro terminal, rode o frontend
npm run dev
```

### Opção 2: Backend Hospedado (Produção)

Para o app funcionar online, você precisa hospedar o backend. Opções:

#### A. Heroku

```bash
# No diretório do backend
heroku create nome-do-seu-app
git push heroku main
```

URL: `https://nome-do-seu-app.herokuapp.com`

#### B. Railway

1. Vá para [railway.app](https://railway.app)
2. Conecte seu repositório do backend
3. Railway fará deploy automático

URL: `https://nome-do-seu-app.railway.app`

#### C. Render

1. Vá para [render.com](https://render.com)
2. Crie um novo **Web Service**
3. Conecte seu repositório do backend

URL: `https://nome-do-seu-app.onrender.com`

### Configurar CORS no Backend

**IMPORTANTE:** O backend precisa permitir requisições do GitHub Pages!

```java
// No seu backend: SecurityConfig.java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    
    // ✅ Adicione a URL do GitHub Pages
    configuration.setAllowedOrigins(Arrays.asList(
        "http://localhost:3000",
        "http://localhost:5173",
        "https://SEU-USUARIO.github.io" // ← Adicione esta linha
    ));
    
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

### Atualizar URL do Frontend no Backend

O backend gera links de recuperação de senha. Atualize:

```properties
# application.properties
frontend.url=https://SEU-USUARIO.github.io/controle-financeiro-familiar
```

---

## 📦 Build Local (Teste)

Antes de fazer push, você pode testar o build localmente:

```bash
# Criar build de produção
npm run build

# Testar build localmente
npm run preview

# Acessar: http://localhost:3000
```

---

## 🔄 Fluxo de Trabalho

### Desenvolvimento

```bash
# 1. Criar branch para feature
git checkout -b feature/nova-funcionalidade

# 2. Fazer alterações
# ... código ...

# 3. Commit
git add .
git commit -m "Adiciona nova funcionalidade"

# 4. Push
git push origin feature/nova-funcionalidade

# 5. Criar Pull Request no GitHub

# 6. Após aprovação, merge para main
# O deploy acontece automaticamente!
```

### Hotfix

```bash
# 1. Criar branch de hotfix
git checkout -b hotfix/correcao-critica

# 2. Corrigir
# ... código ...

# 3. Commit e push
git add .
git commit -m "Corrige bug crítico"
git push origin hotfix/correcao-critica

# 4. Merge para main
# Deploy automático!
```

---

## 🐛 Troubleshooting

### Problema: Deploy falhou

**Verificar:**
1. Vá para **Actions** no GitHub
2. Clique no workflow com erro
3. Veja os logs

**Soluções comuns:**
```bash
# Erro de dependências
npm ci --legacy-peer-deps

# Erro de build
npm run build -- --debug
```

### Problema: App não carrega

**Verificar:**
1. Console do navegador (F12)
2. Aba Network (requisições)

**Soluções:**
```javascript
// Se ver erro de CORS
// Configure CORS no backend

// Se ver erro 404 na API
// Verifique VITE_API_BASE_URL
```

### Problema: Página em branco

**Causa:** Caminho base incorreto

**Solução:**
```typescript
// vite.config.ts
export default defineConfig({
  base: './', // ← Deve ser './' para caminhos relativos
});
```

### Problema: API não responde

**Verificar:**

1. Backend está rodando?
```bash
curl https://seu-backend.herokuapp.com/actuator/health
```

2. CORS configurado?
```bash
curl -I https://seu-backend.herokuapp.com/members \
  -H "Origin: https://seu-usuario.github.io"
```

3. Variável de ambiente configurada?
```bash
# No GitHub: Settings → Secrets → Actions
# VITE_API_BASE_URL deve estar configurado
```

---

## 📊 Monitoramento

### Ver Status do Deploy

```bash
# Via GitHub CLI
gh run list

# Ver logs do último deploy
gh run view
```

### Analytics (Opcional)

Adicione Google Analytics ou Plausible para monitorar acessos:

```html
<!-- index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
```

---

## 🔒 Segurança

### Variáveis Sensíveis

**NUNCA** commite:
- Senhas
- API keys
- Tokens privados

**Use GitHub Secrets:**
```bash
# Bom ✅
VITE_API_BASE_URL (via GitHub Secrets)

# Ruim ❌
VITE_API_KEY=abc123 (hard-coded)
```

### HTTPS

GitHub Pages usa **HTTPS automático**. Não precisa configurar!

```
https://seu-usuario.github.io/controle-financeiro-familiar/
        ↑ HTTPS ativado automaticamente
```

---

## 🎯 Checklist de Deploy

### Antes do Primeiro Deploy

- [ ] Criar repositório no GitHub
- [ ] Adicionar `.env.example`
- [ ] Configurar `.gitignore`
- [ ] Habilitar GitHub Pages (Settings → Pages)
- [ ] Configurar VITE_API_BASE_URL (se tiver backend)
- [ ] Atualizar CORS no backend
- [ ] Atualizar `frontend.url` no backend

### A Cada Deploy

- [ ] Testar localmente (`npm run build && npm run preview`)
- [ ] Commit com mensagem descritiva
- [ ] Push para main
- [ ] Verificar Actions (deploy bem-sucedido?)
- [ ] Testar app no GitHub Pages
- [ ] Verificar console (F12) por erros

---

## 📚 Recursos Úteis

- [Documentação do Vite](https://vitejs.dev/guide/static-deploy.html)
- [GitHub Pages Docs](https://docs.github.com/pages)
- [GitHub Actions Docs](https://docs.github.com/actions)

---

## 🆘 Suporte

### Problemas Comuns

| Problema | Solução |
|----------|---------|
| Página 404 | Verificar base path no vite.config.ts |
| Erro CORS | Configurar CORS no backend |
| API offline | Verificar URL do backend |
| Build falha | Verificar logs no Actions |

### Onde Buscar Ajuda

1. **Logs do GitHub Actions:** `Actions` → Último workflow
2. **Console do navegador:** F12 → Console
3. **Network tab:** F12 → Network (ver requisições)

---

## 📝 Exemplo Completo

### 1. Clone o Projeto
```bash
git clone https://github.com/SEU-USUARIO/controle-financeiro-familiar.git
cd controle-financeiro-familiar
```

### 2. Instale Dependências
```bash
npm install
```

### 3. Configure Ambiente
```bash
cp .env.example .env
# Edite .env com a URL do seu backend
```

### 4. Teste Local
```bash
npm run dev
# Acesse: http://localhost:3000
```

### 5. Build de Produção
```bash
npm run build
npm run preview
```

### 6. Deploy
```bash
git add .
git commit -m "Deploy to production"
git push origin main

# Aguarde 2-3 minutos
# Acesse: https://seu-usuario.github.io/controle-financeiro-familiar/
```

---

## 🎉 Conclusão

Agora seu aplicativo está publicado e acessível na internet!

**URL do seu app:**
```
https://SEU-USUARIO.github.io/controle-financeiro-familiar/
```

**Próximos passos:**
- [ ] Configurar domínio customizado (opcional)
- [ ] Adicionar analytics
- [ ] Configurar PWA (Progressive Web App)
- [ ] Implementar service worker (cache offline)

---

**Versão:** 2.3.5  
**Última atualização:** 30 de Outubro de 2025  
**Status:** ✅ Pronto para deploy
