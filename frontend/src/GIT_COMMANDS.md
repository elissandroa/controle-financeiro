# 📝 Comandos Git Úteis - Deploy e Manutenção

Guia de referência rápida com comandos Git essenciais para deploy e manutenção do projeto.

---

## 🚀 Primeiro Deploy

### Inicializar e Fazer Primeiro Push

```bash
# 1. Inicializar repositório Git
git init

# 2. Adicionar todos os arquivos
git add .

# 3. Fazer primeiro commit
git commit -m "Initial commit: Controle Financeiro v2.4.0"

# 4. Conectar ao GitHub (substitua SEU-USUARIO)
git remote add origin https://github.com/SEU-USUARIO/controle-financeiro-familiar.git

# 5. Renomear branch para main
git branch -M main

# 6. Fazer push inicial
git push -u origin main
```

---

## 📦 Atualizações e Deploy

### Workflow Básico

```bash
# 1. Ver status dos arquivos
git status

# 2. Adicionar arquivos modificados
git add .

# 3. Fazer commit
git commit -m "Descrição da alteração"

# 4. Enviar para GitHub (dispara deploy automático)
git push origin main
```

### Commit Específico de Arquivos

```bash
# Adicionar arquivo específico
git add caminho/do/arquivo.tsx

# Adicionar múltiplos arquivos
git add arquivo1.tsx arquivo2.tsx arquivo3.tsx

# Adicionar todos arquivos .tsx
git add *.tsx

# Adicionar pasta inteira
git add components/

# Commit
git commit -m "Atualiza componentes X, Y e Z"
git push origin main
```

### Mensagens de Commit Descritivas

```bash
# ✅ Boas mensagens
git commit -m "feat: Adiciona filtro de data no relatório"
git commit -m "fix: Corrige erro no cálculo de saldo"
git commit -m "docs: Atualiza guia de deploy"
git commit -m "style: Melhora responsividade do dashboard"
git commit -m "refactor: Simplifica lógica de autenticação"

# ❌ Evite mensagens vagas
git commit -m "updates"
git commit -m "fix"
git commit -m "changes"
```

---

## 🌿 Trabalhando com Branches

### Criar e Usar Feature Branch

```bash
# Criar nova branch
git checkout -b feature/nova-funcionalidade

# Fazer alterações...
git add .
git commit -m "feat: Implementa nova funcionalidade"

# Enviar branch para GitHub
git push origin feature/nova-funcionalidade

# No GitHub: criar Pull Request

# Após merge, voltar para main
git checkout main
git pull origin main

# Deletar branch local
git branch -d feature/nova-funcionalidade
```

### Hotfix (Correção Urgente)

```bash
# Criar branch de hotfix
git checkout -b hotfix/corrige-bug-critico

# Corrigir...
git add .
git commit -m "fix: Corrige bug crítico no login"
git push origin hotfix/corrige-bug-critico

# Merge direto ou via Pull Request
```

---

## 🔍 Visualizar Histórico

### Ver Commits

```bash
# Últimos commits (resumido)
git log --oneline

# Últimos 5 commits
git log -5

# Último commit com detalhes
git log -1

# Commits de hoje
git log --since="today"

# Commits de um autor
git log --author="Seu Nome"

# Ver alterações de cada commit
git log -p

# Formato customizado bonito
git log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset'
```

### Ver Diferenças

```bash
# Ver alterações não commitadas
git diff

# Ver alterações em arquivo específico
git diff caminho/arquivo.tsx

# Ver diferenças entre branches
git diff main..feature/nova-funcionalidade

# Ver apenas nomes de arquivos alterados
git diff --name-only

# Ver estatísticas
git diff --stat
```

---

## ⏮️ Desfazer Alterações

### Antes do Commit

```bash
# Desfazer alterações em arquivo específico
git checkout -- arquivo.tsx

# Desfazer todas as alterações não commitadas
git checkout -- .

# Remover arquivo do staging (após git add)
git reset HEAD arquivo.tsx

# Limpar arquivos não rastreados
git clean -fd
```

### Depois do Commit (Local)

```bash
# Desfazer último commit (mantém alterações)
git reset --soft HEAD~1

# Desfazer último commit (descarta alterações) - CUIDADO!
git reset --hard HEAD~1

# Desfazer últimos 3 commits
git reset --soft HEAD~3

# Alterar mensagem do último commit
git commit --amend -m "Nova mensagem"

# Adicionar arquivo esquecido no último commit
git add arquivo-esquecido.tsx
git commit --amend --no-edit
```

### Depois do Push (Remoto)

```bash
# Reverter commit específico (cria novo commit)
git revert HASH_DO_COMMIT

# Reverter último commit
git revert HEAD

# Push forçado (CUIDADO! Reescreve história)
git push origin main --force
```

---

## 🔄 Atualizar Código Local

### Puxar Atualizações

```bash
# Puxar alterações do GitHub
git pull origin main

# Buscar sem fazer merge
git fetch origin

# Ver branches remotas
git branch -r

# Atualizar todas as branches
git fetch --all
```

### Resolver Conflitos

```bash
# Ao puxar código e ter conflitos:
git pull origin main

# Git mostra conflitos, edite os arquivos
# Procure por: <<<<<<< HEAD

# Após resolver:
git add .
git commit -m "Resolve conflitos de merge"
git push origin main
```

---

## 🏷️ Tags (Versões)

### Criar e Gerenciar Tags

```bash
# Criar tag anotada
git tag -a v2.4.0 -m "Versão 2.4.0 - Deploy GitHub Pages"

# Criar tag simples
git tag v2.4.0

# Enviar tag para GitHub
git push origin v2.4.0

# Enviar todas as tags
git push origin --tags

# Listar tags
git tag

# Ver detalhes da tag
git show v2.4.0

# Deletar tag local
git tag -d v2.4.0

# Deletar tag remota
git push origin :refs/tags/v2.4.0
```

---

## 📋 Informações do Repositório

### Status e Informações

```bash
# Ver status atual
git status

# Versão resumida
git status -s

# Ver configuração
git config --list

# Ver remote
git remote -v

# Ver branches
git branch

# Ver todas as branches (local + remota)
git branch -a
```

---

## 🔧 Configuração

### Configurar Git

```bash
# Configurar nome
git config --global user.name "Seu Nome"

# Configurar email
git config --global user.email "seu@email.com"

# Configurar editor
git config --global core.editor "code --wait"

# Ver configuração
git config --global --list

# Aliases úteis
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual 'log --graph --oneline --all'
```

---

## 🚨 Situações Especiais

### Forçar Redeploy

```bash
# Commit vazio para disparar deploy
git commit --allow-empty -m "Trigger deploy"
git push origin main
```

### Resetar para Commit Específico

```bash
# Ver histórico
git log --oneline

# Resetar para commit específico (mantém alterações)
git reset --soft HASH_DO_COMMIT

# Resetar para commit específico (descarta tudo)
git reset --hard HASH_DO_COMMIT

# Push forçado
git push origin main --force
```

### Limpar Histórico (Começar do Zero)

```bash
# ⚠️ CUIDADO: Apaga todo histórico!
rm -rf .git
git init
git add .
git commit -m "Fresh start"
git remote add origin https://github.com/SEU-USUARIO/controle-financeiro-familiar.git
git push -u origin main --force
```

---

## 🗑️ Remover Arquivos

### Remover do Git

```bash
# Remover arquivo do Git e do disco
git rm arquivo.txt
git commit -m "Remove arquivo.txt"
git push origin main

# Remover apenas do Git (mantém no disco)
git rm --cached arquivo.txt
git commit -m "Remove arquivo.txt do Git"
git push origin main

# Remover pasta
git rm -r pasta/
git commit -m "Remove pasta/"
git push origin main

# Parar de rastrear .env (se já foi commitado)
git rm --cached .env
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Remove .env do Git"
git push origin main
```

---

## 📊 Estatísticas

### Análise do Repositório

```bash
# Número de commits
git rev-list --count HEAD

# Commits por autor
git shortlog -sn

# Linhas alteradas por autor
git log --author="Seu Nome" --pretty=tformat: --numstat | \
  awk '{ add += $1; subs += $2; loc += $1 - $2 } END { printf "added lines: %s removed lines: %s total lines: %s\n", add, subs, loc }'

# Tamanho do repositório
git count-objects -vH

# Arquivos mais modificados
git log --pretty=format: --name-only | sort | uniq -c | sort -rg | head -10
```

---

## 🔐 Autenticação

### GitHub Personal Access Token

```bash
# 1. Gerar token no GitHub:
# Settings → Developer settings → Personal access tokens → Generate new token

# 2. Usar token ao invés de senha
git push origin main
# Username: seu-usuario
# Password: ghp_SEU_TOKEN_AQUI

# 3. Cache de credenciais (Linux/Mac)
git config --global credential.helper cache
git config --global credential.helper 'cache --timeout=3600'

# 4. Cache de credenciais (Windows)
git config --global credential.helper wincred
```

---

## 🚀 Comandos para Deploy

### Workflow Completo de Deploy

```bash
# 1. Atualizar código local
git pull origin main

# 2. Fazer alterações
# ... editar arquivos ...

# 3. Testar localmente
npm run dev
npm run build
npm run preview

# 4. Verificar alterações
git status
git diff

# 5. Adicionar arquivos
git add .

# 6. Commit descritivo
git commit -m "feat: Adiciona novo relatório de gastos"

# 7. Push (dispara deploy automático)
git push origin main

# 8. Acompanhar deploy
# GitHub → Actions → Aguardar ✅

# 9. Testar em produção
# https://seu-usuario.github.io/controle-financeiro-familiar/
```

---

## 📚 Aliases Recomendados

### Adicionar ao ~/.gitconfig

```ini
[alias]
    # Status
    st = status
    s = status -s
    
    # Add/Commit
    a = add
    aa = add .
    cm = commit -m
    ca = commit --amend
    
    # Log
    l = log --oneline
    lg = log --graph --pretty=format:'%Cred%h%Creset -%C(yellow)%d%Creset %s %Cgreen(%cr) %C(bold blue)<%an>%Creset'
    last = log -1 HEAD
    
    # Branch
    br = branch
    co = checkout
    cb = checkout -b
    
    # Push/Pull
    p = push
    pl = pull
    
    # Diff
    d = diff
    ds = diff --staged
    
    # Outros
    unstage = reset HEAD --
    undo = reset --soft HEAD~1
    visual = log --graph --oneline --all
```

**Usar:**
```bash
git st        # ao invés de git status
git aa        # ao invés de git add .
git cm "msg"  # ao invés de git commit -m "msg"
git lg        # log bonito
```

---

## 🎯 Checklist de Deploy

```bash
# Antes do push
□ git status                    # Verificar arquivos
□ git diff                      # Ver alterações
□ npm run build                 # Testar build
□ git add .                     # Adicionar arquivos
□ git commit -m "mensagem"      # Commit descritivo
□ git push origin main          # Push

# Após push
□ GitHub → Actions              # Verificar deploy
□ Aguardar ✅ verde             # Deploy bem-sucedido
□ Testar produção               # Acessar site
□ Verificar funcionalidades     # Tudo OK?
```

---

## 🆘 Ajuda

```bash
# Ajuda geral
git help

# Ajuda de comando específico
git help commit
git help push
git help log

# Versão do Git
git --version
```

---

**📌 Dica:** Salve este arquivo como referência rápida!

**Versão:** 2.4.0  
**Última atualização:** 30 de Outubro de 2025
