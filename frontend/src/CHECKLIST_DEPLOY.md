# ✅ Checklist Completo - Deploy GitHub Pages

Use este checklist para garantir que tudo está configurado corretamente antes, durante e após o deploy.

---

## 📋 Pré-Deploy (Preparação)

### Ambiente Local

- [ ] Node.js instalado (v18+)
  ```bash
  node --version
  ```

- [ ] Git instalado
  ```bash
  git --version
  ```

- [ ] Dependências instaladas
  ```bash
  npm install
  ```

- [ ] Aplicativo funciona localmente
  ```bash
  npm run dev
  # Acessar http://localhost:3000
  ```

- [ ] Build funciona sem erros
  ```bash
  npm run build
  ```

- [ ] Preview do build funciona
  ```bash
  npm run preview
  # Acessar http://localhost:3000
  ```

### Arquivos de Configuração

- [ ] `vite.config.ts` existe
- [ ] `.github/workflows/deploy.yml` existe
- [ ] `.env.example` existe
- [ ] `.gitignore` existe
- [ ] Arquivo `.env` NÃO está no Git
  ```bash
  git status
  # .env não deve aparecer
  ```

---

## 🔧 Configuração GitHub

### Criar Repositório

- [ ] Repositório criado no GitHub
- [ ] Nome do repositório definido (ex: `controle-financeiro-familiar`)
- [ ] Repositório é público ou privado (sua escolha)

### Conectar Local com GitHub

- [ ] Remote configurado
  ```bash
  git remote add origin https://github.com/SEU-USUARIO/controle-financeiro-familiar.git
  ```

- [ ] Remote correto
  ```bash
  git remote -v
  # Deve mostrar seu repositório
  ```

- [ ] Branch principal é `main`
  ```bash
  git branch -M main
  ```

### Primeiro Push

- [ ] Todos os arquivos adicionados
  ```bash
  git add .
  ```

- [ ] Commit inicial feito
  ```bash
  git commit -m "Initial commit: v2.4.0 - GitHub Pages ready"
  ```

- [ ] Push realizado
  ```bash
  git push -u origin main
  ```

- [ ] Código visível no GitHub
  - Acessar: `https://github.com/SEU-USUARIO/controle-financeiro-familiar`

---

## ⚙️ Configurar GitHub Pages

### Habilitar Pages

- [ ] Ir para **Settings** do repositório
- [ ] Menu lateral → **Pages**
- [ ] **Source** → Selecionar **GitHub Actions**
- [ ] Mensagem de sucesso aparece

### Verificar Actions

- [ ] Ir para aba **Actions**
- [ ] Workflow "Deploy to GitHub Pages" está listado
- [ ] Primeiro deploy iniciou automaticamente

---

## 🚀 Aguardar Primeiro Deploy

### Monitorar Deploy

- [ ] Actions → Clicar no workflow em execução
- [ ] Acompanhar progresso:
  - [ ] Build job (verde ✅)
  - [ ] Deploy job (verde ✅)
- [ ] Deploy concluído sem erros
- [ ] Tempo total: ~2-5 minutos

### Verificar Deployment

- [ ] Settings → Pages mostra URL:
  ```
  https://SEU-USUARIO.github.io/controle-financeiro-familiar/
  ```
- [ ] Status mostra "deployed"

---

## 🌐 Testar Aplicativo Online

### Acesso Básico

- [ ] Acessar URL do GitHub Pages
- [ ] Página carrega corretamente
- [ ] Sem erro 404
- [ ] Tela de login aparece

### Funcionalidades Frontend

- [ ] Tela de login renderiza
- [ ] Formulário de login visível
- [ ] Link "Esqueci minha senha" funcional
- [ ] Estilos carregam corretamente
- [ ] Sem erros no console (F12)

### Responsividade

- [ ] Desktop funciona (1920x1080)
- [ ] Tablet funciona (768x1024)
- [ ] Mobile funciona (375x667)
- [ ] Menu responsivo funciona

---

## 🔌 Configuração Backend (Se Aplicável)

### Backend Local

Se usar backend local (desenvolvimento):

- [ ] Backend rodando em `localhost:8080`
- [ ] Aplicativo online **não** conecta (esperado)
- [ ] Mensagem de erro de conexão (esperado)

### Backend Hospedado

Se hospedar backend em produção:

#### Hospedar Backend

- [ ] Backend hospedado em:
  - [ ] Railway
  - [ ] Heroku
  - [ ] Render
  - [ ] Outro: __________

- [ ] URL do backend obtida:
  ```
  https://seu-backend.railway.app
  ```

- [ ] Backend responde a health check:
  ```bash
  curl https://seu-backend.railway.app/actuator/health
  # Deve retornar: {"status":"UP"}
  ```

#### Configurar CORS

- [ ] CORS configurado no backend
- [ ] `allowedOrigins` inclui GitHub Pages:
  ```java
  "https://SEU-USUARIO.github.io"
  ```

- [ ] Backend reiniciado após configurar CORS

#### Configurar Variável de Ambiente

- [ ] GitHub → Settings → Secrets → Actions
- [ ] Secret criado: `VITE_API_BASE_URL`
- [ ] Valor: `https://seu-backend.railway.app`

#### Forçar Redeploy

- [ ] Commit vazio para redeploy:
  ```bash
  git commit --allow-empty -m "Update API URL"
  git push origin main
  ```

- [ ] Aguardar novo deploy (~2-3 min)

#### Testar Integração

- [ ] Abrir aplicativo no GitHub Pages
- [ ] Abrir DevTools (F12) → Network
- [ ] Fazer login
- [ ] Requisições vão para backend hospedado
- [ ] Sem erro de CORS
- [ ] Login funciona
- [ ] Dashboard carrega dados

---

## 🎨 Configuração Opcional

### Domínio Customizado

Se quiser usar domínio próprio (ex: `financeiro.seudominio.com`):

- [ ] Domínio registrado
- [ ] DNS configurado (CNAME ou A records)
- [ ] GitHub → Settings → Pages → Custom domain
- [ ] Domínio adicionado
- [ ] DNS check passou ✅
- [ ] Enforce HTTPS habilitado
- [ ] Certificado SSL provisionado
- [ ] Site acessível via HTTPS

### Analytics (Opcional)

- [ ] Google Analytics configurado
- [ ] Código de tracking adicionado
- [ ] Primeiros dados aparecendo

### PWA (Opcional)

- [ ] Service worker implementado
- [ ] Manifest.json criado
- [ ] Ícones adicionados
- [ ] App instalável

---

## 🧪 Testes Pós-Deploy

### Testes Funcionais

- [ ] Login com credenciais válidas
- [ ] Dashboard carrega
- [ ] Transações listam (se backend conectado)
- [ ] Membros listam (se backend conectado)
- [ ] Relatórios funcionam
- [ ] Logout funciona
- [ ] Recuperação de senha funciona (se backend)

### Testes de Performance

- [ ] Lighthouse score > 90
  - Performance: ____
  - Accessibility: ____
  - Best Practices: ____
  - SEO: ____

- [ ] Tempo de carregamento < 3s
- [ ] Sem erros no console
- [ ] Sem warnings críticos

### Testes de Segurança

- [ ] HTTPS habilitado ✅
- [ ] Certificado SSL válido 🔒
- [ ] Headers de segurança corretos
- [ ] Sem credenciais expostas no código

---

## 📱 Testes em Dispositivos

### Desktop

- [ ] Chrome
- [ ] Firefox
- [ ] Safari (Mac)
- [ ] Edge

### Mobile

- [ ] Chrome Android
- [ ] Safari iOS
- [ ] Responsivo funciona

---

## 📝 Documentação

### Atualizar Docs

- [ ] README.md atualizado com URL de produção
- [ ] CHANGELOG.md documentado
- [ ] Links testados

### Compartilhar

- [ ] URL compartilhada com equipe
- [ ] Credenciais de teste fornecidas
- [ ] Guia de uso disponibilizado

---

## 🔄 Workflow de Atualização

### Para Próximos Deploys

- [ ] Fazer alterações no código
- [ ] Testar localmente (`npm run dev`)
- [ ] Build funciona (`npm run build`)
- [ ] Commit descritivo
  ```bash
  git commit -m "feat: Adiciona nova funcionalidade"
  ```
- [ ] Push para main
  ```bash
  git push origin main
  ```
- [ ] Aguardar deploy automático
- [ ] Testar em produção

---

## 🐛 Troubleshooting

### Se Deploy Falhar

- [ ] Ver logs em Actions
- [ ] Identificar erro:
  - [ ] Build error
  - [ ] Dependency error
  - [ ] Configuration error
- [ ] Corrigir localmente
- [ ] Testar build local
- [ ] Push novamente

### Se Site Não Carregar

- [ ] Verificar GitHub Pages habilitado
- [ ] Verificar Source = "GitHub Actions"
- [ ] Verificar deploy concluiu (Actions ✅)
- [ ] Limpar cache do navegador (Ctrl+Shift+R)
- [ ] Aguardar alguns minutos (propagação)

### Se API Não Funcionar

- [ ] Backend está online?
  ```bash
  curl https://seu-backend.railway.app/actuator/health
  ```
- [ ] CORS configurado?
- [ ] `VITE_API_BASE_URL` correto no GitHub Secrets?
- [ ] Frontend redeployado após configurar secret?

---

## ✅ Checklist Final

### Tudo Funcionando?

- [ ] ✅ Site online e acessível
- [ ] ✅ HTTPS habilitado
- [ ] ✅ Sem erros no console
- [ ] ✅ Deploy automático funciona
- [ ] ✅ Backend integrado (se aplicável)
- [ ] ✅ Testes passando
- [ ] ✅ Documentação atualizada
- [ ] ✅ Equipe notificada

### URLs Importantes

```
Frontend (GitHub Pages):
https://SEU-USUARIO.github.io/controle-financeiro-familiar/

Backend (se hospedado):
https://seu-backend.railway.app

Repositório:
https://github.com/SEU-USUARIO/controle-financeiro-familiar

Actions (CI/CD):
https://github.com/SEU-USUARIO/controle-financeiro-familiar/actions
```

---

## 🎉 Conclusão

### Se Todos os Itens Estão Marcados:

**🎉 PARABÉNS! Seu aplicativo está no ar!**

Próximos passos recomendados:

1. [ ] Monitorar uso e performance
2. [ ] Coletar feedback dos usuários
3. [ ] Planejar próximas features
4. [ ] Configurar backup do banco de dados
5. [ ] Implementar monitoring/alertas

---

## 📚 Recursos de Ajuda

Se ficou travado em algum passo:

- 📖 [DEPLOY_QUICK_START.md](./DEPLOY_QUICK_START.md) - Guia rápido
- 📦 [DEPLOYMENT.md](./DEPLOYMENT.md) - Guia detalhado
- 🗄️ [BACKEND_DEPLOYMENT.md](./BACKEND_DEPLOYMENT.md) - Deploy backend
- 🌐 [CUSTOM_DOMAIN.md](./CUSTOM_DOMAIN.md) - Domínio customizado
- 📝 [GIT_COMMANDS.md](./GIT_COMMANDS.md) - Comandos Git
- 🐛 [DEBUGGING.md](./DEBUGGING.md) - Troubleshooting

---

## 💾 Salvar Este Checklist

**Dica:** Imprima ou salve este checklist para usar a cada deploy!

```bash
# Copiar para uso local
cp CHECKLIST_DEPLOY.md MEU_CHECKLIST.md
```

---

**Versão do Checklist:** 2.4.0  
**Última atualização:** 30 de Outubro de 2025  
**Itens totais:** 150+ verificações

**Tempo estimado para primeiro deploy:** 15-30 minutos  
**Tempo estimado para deploys seguintes:** 2-5 minutos (automático)
