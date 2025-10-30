# 🌐 Configuração de Domínio Customizado

Este guia explica como configurar um domínio personalizado (ex: `financeiro.seudominio.com`) para o aplicativo hospedado no GitHub Pages.

---

## 📋 Pré-requisitos

- [ ] Aplicativo publicado no GitHub Pages
- [ ] Domínio próprio (comprado em GoDaddy, Namecheap, Registro.br, etc.)
- [ ] Acesso ao painel DNS do seu domínio

---

## 🔧 Configuração DNS

### Opção 1: Usar Subdomínio (Recomendado)

**Exemplo:** `financeiro.seudominio.com`

#### 1. Adicionar Registro CNAME

No painel DNS do seu provedor, adicione:

| Tipo | Nome | Valor | TTL |
|------|------|-------|-----|
| CNAME | `financeiro` | `SEU-USUARIO.github.io` | 3600 |

**Exemplos por provedor:**

<details>
<summary>GoDaddy</summary>

1. Faça login no GoDaddy
2. Vá para **Meus Produtos** → **DNS**
3. Clique em **Adicionar**
4. Selecione **CNAME**
5. Preencha:
   - Nome: `financeiro`
   - Valor: `SEU-USUARIO.github.io`
   - TTL: `1 hora`
6. Salve

</details>

<details>
<summary>Namecheap</summary>

1. Faça login no Namecheap
2. Vá para **Domain List** → seu domínio
3. Clique em **Advanced DNS**
4. Adicione novo registro:
   - Type: `CNAME Record`
   - Host: `financeiro`
   - Value: `SEU-USUARIO.github.io`
   - TTL: `Automatic`
5. Salve

</details>

<details>
<summary>Registro.br</summary>

1. Faça login no Registro.br
2. Vá para **Meus Domínios**
3. Selecione seu domínio → **Editar Zona**
4. Adicione:
   - Entrada: `financeiro`
   - Tipo: `CNAME`
   - Dados: `SEU-USUARIO.github.io.` (com ponto final)
   - TTL: `3600`
5. Salve

</details>

---

### Opção 2: Usar Domínio Raiz (Apex)

**Exemplo:** `seudominio.com`

#### 1. Adicionar Registros A

No painel DNS, adicione **4 registros A**:

| Tipo | Nome | Valor | TTL |
|------|------|-------|-----|
| A | `@` | `185.199.108.153` | 3600 |
| A | `@` | `185.199.109.153` | 3600 |
| A | `@` | `185.199.110.153` | 3600 |
| A | `@` | `185.199.111.153` | 3600 |

#### 2. Adicionar Registro CNAME para www

| Tipo | Nome | Valor | TTL |
|------|------|-------|-----|
| CNAME | `www` | `SEU-USUARIO.github.io` | 3600 |

**Nota:** IPs oficiais do GitHub Pages. [Referência](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)

---

## ⚙️ Configuração no GitHub

### 1. Adicionar Domínio Customizado

1. Vá para o repositório no GitHub
2. Clique em **Settings**
3. No menu lateral, clique em **Pages**
4. Em **Custom domain**, digite seu domínio:
   - Subdomínio: `financeiro.seudominio.com`
   - OU Apex: `seudominio.com`
5. Clique em **Save**

### 2. Aguardar Verificação DNS

O GitHub verificará o DNS. Pode levar alguns minutos ou até 24 horas.

Você verá:
```
✅ DNS check successful
```

### 3. Habilitar HTTPS

**IMPORTANTE:** Espere a verificação DNS concluir!

1. Na mesma página (Settings → Pages)
2. Marque a opção:
   ```
   ☑️ Enforce HTTPS
   ```

Aguarde alguns minutos. O GitHub provisionará o certificado SSL automaticamente.

---

## 📝 Criar Arquivo CNAME

O GitHub Actions já cria automaticamente, mas se quiser criar manualmente:

```bash
# Na raiz do projeto
echo "financeiro.seudominio.com" > public/CNAME
```

**Importante:** O arquivo `CNAME` deve conter **apenas** o domínio, sem `http://` ou `https://`.

---

## 🔍 Verificar Configuração

### 1. Verificar DNS

```bash
# Para subdomínio
dig financeiro.seudominio.com +noall +answer

# Deve mostrar:
# financeiro.seudominio.com. 3600 IN CNAME SEU-USUARIO.github.io.
```

```bash
# Para apex
dig seudominio.com +noall +answer

# Deve mostrar os 4 IPs do GitHub
```

### 2. Testar no Navegador

```bash
# Deve redirecionar para HTTPS
http://financeiro.seudominio.com

# Deve carregar com HTTPS
https://financeiro.seudominio.com
```

---

## 🐛 Troubleshooting

### Problema: DNS não resolve

**Sintomas:**
```
ERR_NAME_NOT_RESOLVED
ou
This site can't be reached
```

**Soluções:**

1. **Aguarde propagação DNS** (pode levar até 24h)
   ```bash
   # Verificar propagação mundial
   # Acesse: https://www.whatsmydns.net/
   # Digite: financeiro.seudominio.com
   ```

2. **Verifique o registro DNS**
   ```bash
   # Deve retornar o CNAME correto
   dig financeiro.seudominio.com
   ```

3. **Limpe cache DNS local**
   ```bash
   # Windows
   ipconfig /flushdns
   
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
   
   # Linux
   sudo systemd-resolve --flush-caches
   ```

---

### Problema: Certificado SSL não provisiona

**Sintomas:**
```
⚠️ Not yet available for your site because the certificate has not finished being issued
```

**Soluções:**

1. **Aguarde até 1 hora** para o Let's Encrypt emitir

2. **Desmarque e marque novamente** "Enforce HTTPS"

3. **Remova e adicione novamente** o domínio customizado

4. **Verifique CAA Records** (alguns provedores bloqueiam Let's Encrypt)
   ```bash
   dig seudominio.com CAA
   
   # Se houver CAA, adicione:
   # seudominio.com. 3600 IN CAA 0 issue "letsencrypt.org"
   ```

---

### Problema: Página 404 após adicionar domínio

**Causa:** Arquivo CNAME não está no build

**Solução:**

1. Criar pasta `public` na raiz do projeto
2. Criar arquivo `public/CNAME` com o domínio
3. Rebuild e redeploy

```bash
mkdir -p public
echo "financeiro.seudominio.com" > public/CNAME
git add .
git commit -m "Add CNAME file"
git push
```

---

### Problema: Mixed Content (HTTP/HTTPS)

**Sintomas:**
```
Mixed Content: The page was loaded over HTTPS, but requested an insecure resource
```

**Causa:** API backend usando HTTP

**Solução:** Backend também deve usar HTTPS

```env
# .env (produção)
VITE_API_BASE_URL=https://api.seudominio.com
```

---

## 🔐 Configurar Backend com Domínio Customizado

### 1. Atualizar CORS

```java
// SecurityConfig.java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    
    configuration.setAllowedOrigins(Arrays.asList(
        "http://localhost:3000",
        "https://SEU-USUARIO.github.io",
        "https://financeiro.seudominio.com" // ← Adicione seu domínio
    ));
    
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

### 2. Atualizar URL do Frontend

```properties
# application.properties
frontend.url=https://financeiro.seudominio.com
```

---

## 📊 Exemplos de Configuração Completa

### Exemplo 1: Subdomínio

**Domínio:** `app.meusite.com.br`

**DNS:**
```
app.meusite.com.br. 3600 IN CNAME usuario.github.io.
```

**GitHub Pages:**
```
Custom domain: app.meusite.com.br
☑️ Enforce HTTPS
```

**URL Final:**
```
https://app.meusite.com.br/
```

---

### Exemplo 2: Domínio Apex

**Domínio:** `financas.com.br`

**DNS:**
```
financas.com.br. 3600 IN A 185.199.108.153
financas.com.br. 3600 IN A 185.199.109.153
financas.com.br. 3600 IN A 185.199.110.153
financas.com.br. 3600 IN A 185.199.111.153
www.financas.com.br. 3600 IN CNAME usuario.github.io.
```

**GitHub Pages:**
```
Custom domain: financas.com.br
☑️ Enforce HTTPS
```

**URL Final:**
```
https://financas.com.br/
https://www.financas.com.br/ (redireciona)
```

---

## ✅ Checklist de Configuração

### Configuração DNS
- [ ] Registro CNAME adicionado (subdomínio)
- [ ] OU Registros A adicionados (apex)
- [ ] DNS propagado (verificar com `dig`)
- [ ] Cache DNS local limpo

### Configuração GitHub
- [ ] Custom domain adicionado (Settings → Pages)
- [ ] DNS check bem-sucedido ✅
- [ ] Enforce HTTPS habilitado
- [ ] Certificado SSL provisionado
- [ ] Site acessível via HTTPS

### Configuração Backend
- [ ] CORS atualizado com novo domínio
- [ ] `frontend.url` atualizada
- [ ] Backend usa HTTPS

### Testes
- [ ] `http://` redireciona para `https://`
- [ ] Domínio carrega o site corretamente
- [ ] API funciona (sem erro CORS)
- [ ] Certificado SSL válido (cadeado verde 🔒)

---

## 🎯 Recursos Úteis

- [Documentação Oficial GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [Verificar Propagação DNS](https://www.whatsmydns.net/)
- [Testar SSL](https://www.ssllabs.com/ssltest/)
- [IPs do GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site#configuring-an-apex-domain)

---

## 📞 Suporte

Se após seguir este guia o domínio não funcionar:

1. **Verifique propagação DNS:** https://www.whatsmydns.net/
2. **Teste com `dig`:** `dig seudominio.com`
3. **Verifique no GitHub:** Settings → Pages (deve estar verde ✅)
4. **Aguarde até 24h** para propagação completa

---

**Versão:** 2.3.5  
**Última atualização:** 30 de Outubro de 2025  
**Status:** ✅ Pronto para uso
