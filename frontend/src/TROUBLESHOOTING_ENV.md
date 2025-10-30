# 🔧 Troubleshooting - Variáveis de Ambiente

Guia para resolver problemas comuns com variáveis de ambiente no Vite.

---

## ❌ Erro: Cannot read properties of undefined (reading 'VITE_API_BASE_URL')

### Sintoma

```
TypeError: Cannot read properties of undefined (reading 'VITE_API_BASE_URL')
    at components/api-service.ts:4:37
```

### Causa

O código tentou acessar `import.meta.env.VITE_API_BASE_URL` mas `import.meta` estava undefined.

Isso acontece quando:
1. O código roda fora do contexto do Vite (ex: testes, SSR)
2. TypeScript não reconhece os tipos do Vite
3. Build ou bundle não inclui as definições corretas

---

## ✅ Solução Implementada

### 1. Acesso Seguro às Variáveis

**Arquivo:** `/components/api-service.ts`

```typescript
// ❌ ANTES (Causava erro)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

// ✅ AGORA (Seguro)
const API_BASE_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 
  'http://localhost:8080';
```

**Explicação:**
- `typeof import.meta !== 'undefined'` - Verifica se `import.meta` existe
- `import.meta.env?.VITE_API_BASE_URL` - Optional chaining para acessar com segurança
- `|| 'http://localhost:8080'` - Fallback se variável não existir

---

### 2. Definições de Tipo TypeScript

**Arquivo:** `/vite-env.d.ts` (criado)

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

**Explicação:**
- Define os tipos para `import.meta.env`
- TypeScript agora reconhece `VITE_API_BASE_URL`
- Autocomplete funciona no editor

---

## 🧪 Como Testar

### Teste 1: Desenvolvimento Local

```bash
# Sem .env (deve usar localhost)
npm run dev
# ✅ Deve funcionar com http://localhost:8080

# Com .env
echo "VITE_API_BASE_URL=http://localhost:8080" > .env
npm run dev
# ✅ Deve usar a URL do .env
```

### Teste 2: Build de Produção

```bash
# Build sem variável
npm run build
npm run preview
# ✅ Deve usar http://localhost:8080

# Build com variável
export VITE_API_BASE_URL=https://api.example.com
npm run build
npm run preview
# ✅ Deve usar https://api.example.com
```

### Teste 3: Verificar no Console

```javascript
// Abra DevTools (F12) e digite:
console.log('API URL:', /* copie de api-service.ts */);

// Deve mostrar a URL configurada
```

---

## 📋 Checklist de Verificação

### Arquivos Necessários

- [ ] `/vite-env.d.ts` existe
- [ ] `/components/api-service.ts` usa acesso seguro
- [ ] `/vite.config.ts` está configurado
- [ ] `/.env.example` tem template
- [ ] `/.gitignore` inclui `.env`

### Código Correto

```typescript
// ✅ Correto - com verificação
const API_BASE_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 
  'http://localhost:8080';

// ❌ Errado - sem verificação
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
```

---

## 🔍 Outros Problemas Comuns

### Problema: Variável não é reconhecida

**Sintoma:**
Mesmo configurando `.env`, a variável não é lida.

**Causas:**
1. Nome da variável não começa com `VITE_`
2. Servidor não foi reiniciado
3. `.env` está em lugar errado

**Soluções:**

```bash
# 1. Nome correto
# ✅ Correto
VITE_API_BASE_URL=http://localhost:8080

# ❌ Errado (não começa com VITE_)
API_BASE_URL=http://localhost:8080

# 2. Reiniciar servidor
# Ctrl+C para parar
npm run dev

# 3. Verificar localização
# .env deve estar na RAIZ do projeto
ls -la .env
```

---

### Problema: Variável funciona em dev mas não em build

**Sintoma:**
- `npm run dev` funciona
- `npm run build` ignora variável

**Causa:**
Variáveis de ambiente devem ser passadas no momento do build.

**Solução:**

```bash
# ❌ Errado
npm run build
# .env é ignorado

# ✅ Correto - passar no build
VITE_API_BASE_URL=https://api.example.com npm run build

# Ou exportar antes
export VITE_API_BASE_URL=https://api.example.com
npm run build
```

---

### Problema: TypeScript reclama de tipos

**Sintoma:**
```
Property 'VITE_API_BASE_URL' does not exist on type 'ImportMetaEnv'
```

**Causa:**
Arquivo `vite-env.d.ts` não existe ou está incorreto.

**Solução:**

1. Criar `/vite-env.d.ts`:
```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  // Adicione outras variáveis aqui
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

2. Reiniciar TypeScript server no VSCode:
   - `Ctrl+Shift+P` (ou `Cmd+Shift+P`)
   - Digitar: "TypeScript: Restart TS Server"

---

## 🎯 Boas Práticas

### 1. Sempre Use Acesso Seguro

```typescript
// ✅ Bom - seguro
const value = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MY_VAR) || 
  'default';

// ❌ Ruim - pode quebrar
const value = import.meta.env.VITE_MY_VAR || 'default';
```

### 2. Sempre Tenha Fallback

```typescript
// ✅ Bom - tem fallback
const API_URL = getEnvVar() || 'http://localhost:8080';

// ❌ Ruim - sem fallback
const API_URL = getEnvVar(); // pode ser undefined
```

### 3. Use .env.example

```bash
# .env.example (commitar no Git)
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_NAME=Meu App

# .env (NÃO commitar - adicionar ao .gitignore)
VITE_API_BASE_URL=http://localhost:8080
```

### 4. Documente as Variáveis

```typescript
/**
 * URL base da API
 * 
 * Desenvolvimento: http://localhost:8080
 * Produção: https://api.example.com
 * 
 * Configure via:
 * - .env local: VITE_API_BASE_URL
 * - GitHub Secrets: VITE_API_BASE_URL
 */
const API_BASE_URL = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) || 
  'http://localhost:8080';
```

---

## 📚 Referências

### Vite - Variáveis de Ambiente
- [Documentação Oficial](https://vitejs.dev/guide/env-and-mode.html)
- Variáveis devem começar com `VITE_`
- Disponíveis em `import.meta.env`

### TypeScript - Import Meta
- [Documentação](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#supporting-import-meta)
- Suporte desde TypeScript 4.5+

### GitHub Actions - Secrets
- [Documentação](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- Configurar em: Settings → Secrets → Actions

---

## 🆘 Ainda Com Problemas?

### 1. Verificar Ambiente

```bash
# Node.js
node --version
# Deve ser v18+

# Vite
npm list vite
# Verificar versão

# TypeScript
npm list typescript
# Verificar versão
```

### 2. Limpar Cache

```bash
# Limpar node_modules
rm -rf node_modules package-lock.json
npm install

# Limpar cache do Vite
rm -rf .vite
npm run dev
```

### 3. Verificar Logs

```bash
# Modo debug
DEBUG=vite:* npm run dev

# Ver todas as variáveis
npm run dev -- --debug
```

### 4. Verificar Build

```bash
# Build com logs
npm run build -- --debug

# Ver conteúdo do dist
ls -la dist/
cat dist/assets/*.js | grep -i "api"
```

---

## ✅ Solução Funcionando

Após implementar as correções, você deve ter:

- ✅ Sem erros de `import.meta`
- ✅ Variáveis de ambiente funcionando
- ✅ TypeScript sem erros
- ✅ Build funcionando
- ✅ Dev server funcionando
- ✅ Deploy no GitHub Pages funcionando

---

**Versão:** 2.4.1  
**Última atualização:** 30 de Outubro de 2025  
**Status:** ✅ Corrigido e testado
