# ⚡ Deploy Rápido - GitHub Pages

Guia rápido em 5 minutos para publicar seu aplicativo no GitHub Pages.

---

## 🚀 Passos Rápidos

### 1️⃣ Criar Repositório no GitHub

```bash
# No terminal, dentro da pasta do projeto:
git init
git add .
git commit -m "Deploy inicial v2.4.0"
```

Vá para https://github.com/new e crie um repositório chamado `controle-financeiro-familiar`

```bash
# Conecte ao GitHub (substitua SEU-USUARIO)
git remote add origin https://github.com/SEU-USUARIO/controle-financeiro-familiar.git
git branch -M main
git push -u origin main
```

---

### 2️⃣ Habilitar GitHub Pages

1. No GitHub, vá para o repositório
2. Clique em **Settings** (Configurações)
3. Menu lateral → **Pages**
4. Em **Source**, selecione: **GitHub Actions**

✅ Pronto! Não precisa configurar mais nada.

---

### 3️⃣ Aguardar Deploy

1. Vá para a aba **Actions**
2. Você verá o workflow **"Deploy to GitHub Pages"** rodando
3. Aguarde 2-3 minutos até ficar verde ✅

---

### 4️⃣ Acessar o Site

Seu app estará em:
```
https://SEU-USUARIO.github.io/controle-financeiro-familiar/
```

**Exemplo:**
```
https://joaosilva.github.io/controle-financeiro-familiar/
```

---

## 🔧 Configuração Opcional: Backend Hospedado

Se você tiver um backend hospedado, configure a URL:

### No GitHub:

1. **Settings** → **Secrets and variables** → **Actions**
2. Clique em **New repository secret**
3. Adicione:
   - Nome: `VITE_API_BASE_URL`
   - Valor: `https://seu-backend.herokuapp.com`

### No Código Local:

```bash
# Crie arquivo .env na raiz
echo "VITE_API_BASE_URL=http://localhost:8080" > .env
```

---

## 🔄 Atualizações Futuras

Qualquer push para `main` dispara deploy automático:

```bash
# Faça alterações no código
git add .
git commit -m "Nova funcionalidade"
git push origin main

# Deploy automático inicia!
# Aguarde 2-3 minutos
# Acesse: https://seu-usuario.github.io/controle-financeiro-familiar/
```

---

## ⚙️ Configurar CORS no Backend

**IMPORTANTE:** O backend precisa permitir requisições do GitHub Pages!

Adicione no seu backend Java:

```java
// SecurityConfig.java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    
    configuration.setAllowedOrigins(Arrays.asList(
        "http://localhost:3000",
        "http://localhost:5173",
        "https://SEU-USUARIO.github.io" // ← Adicione esta linha!
    ));
    
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

**E também:**

```properties
# application.properties
frontend.url=https://SEU-USUARIO.github.io/controle-financeiro-familiar
```

---

## ✅ Checklist Completo

### Primeira Vez
- [ ] Criar repositório no GitHub
- [ ] Push do código (`git push origin main`)
- [ ] Habilitar GitHub Pages (Settings → Pages → GitHub Actions)
- [ ] Aguardar primeiro deploy (2-3 min)
- [ ] Acessar URL do GitHub Pages

### Se Tiver Backend Hospedado
- [ ] Configurar `VITE_API_BASE_URL` no GitHub Secrets
- [ ] Atualizar CORS no backend
- [ ] Atualizar `frontend.url` no backend
- [ ] Testar API funcionando

### A Cada Atualização
- [ ] Fazer alterações no código
- [ ] `git add .`
- [ ] `git commit -m "mensagem"`
- [ ] `git push origin main`
- [ ] Aguardar deploy automático
- [ ] Testar no GitHub Pages

---

## 🐛 Problemas Comuns

### Deploy falhou (Actions com ❌)

**Ver logs:**
1. Aba **Actions**
2. Clique no workflow com erro
3. Veja qual step falhou

**Solução comum:**
```bash
# Localmente, teste o build
npm install
npm run build

# Se funcionar, faça push novamente
git push origin main
```

---

### Site não abre (404)

**Verificar:**
1. GitHub Pages está habilitado? (Settings → Pages)
2. Source está como "GitHub Actions"?
3. Deploy terminou? (Actions deve estar verde ✅)

**Solução:**
- Aguarde alguns minutos após deploy
- Force refresh: `Ctrl + Shift + R` (ou `Cmd + Shift + R` no Mac)

---

### API não funciona

**Sintomas:**
- Erro de CORS no console
- Requisições falham

**Solução:**
1. Verifique CORS no backend (código acima)
2. Backend está online? Teste no Postman/Insomnia
3. URL do backend correta? (GitHub Secrets)

---

## 📚 Documentação Detalhada

Quer mais detalhes? Veja:

- 📦 **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Guia completo
- 🌐 **[CUSTOM_DOMAIN.md](./CUSTOM_DOMAIN.md)** - Domínio personalizado
- 🐛 **[DEBUGGING.md](./DEBUGGING.md)** - Troubleshooting

---

## 🎯 Comandos Úteis

```bash
# Ver status do Git
git status

# Ver branches
git branch

# Ver remotes
git remote -v

# Ver último commit
git log -1

# Desfazer último commit (mantém alterações)
git reset --soft HEAD~1

# Forçar push (use com cuidado!)
git push origin main --force
```

---

## 💡 Dicas

### Teste Local Antes de Deploy

```bash
# Build de produção
npm run build

# Testar build
npm run preview

# Se funcionar, pode fazer push!
```

### Ver URL do Site

```bash
# Via GitHub CLI (se instalado)
gh browse

# Ou acesse manualmente:
# https://SEU-USUARIO.github.io/controle-financeiro-familiar/
```

### Cancelar Deploy em Andamento

1. Vá para **Actions**
2. Clique no workflow rodando
3. Clique em **Cancel workflow**

---

## 🎉 Pronto!

Seu aplicativo está online e acessível para qualquer pessoa com o link!

**URL do seu app:**
```
https://SEU-USUARIO.github.io/controle-financeiro-familiar/
```

**Compartilhe com:**
- Família
- Amigos
- Colegas
- Recrutadores

---

**Tempo total:** ~5 minutos ⏱️  
**Custo:** R$ 0,00 (grátis!) 💰  
**Dificuldade:** ⭐⭐☆☆☆ (fácil)

**Versão:** 2.4.0  
**Status:** ✅ Funcionando
