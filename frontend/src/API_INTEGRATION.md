# Integração com API Spring Boot

## Configuração

O aplicativo está configurado para usar a API Java Spring Boot rodando em `http://localhost:8080`.

⚠️ **MODO HÍBRIDO**: O aplicativo funciona em dois modos:
- **Modo Online (API)**: Quando o backend Spring Boot está disponível
- **Modo Offline (Local)**: Quando o backend não está disponível, usando localStorage

## Estrutura

### Arquivos Principais

1. **`/components/api-service.ts`** - Serviço que faz as chamadas HTTP para a API
2. **`/components/data-service.ts`** - Camada de adaptação que converte entre o formato da API e o formato do frontend

## Endpoints Utilizados

### Categories
- `GET /categories` - Lista todas as categorias
- `POST /categories` - Cria uma nova categoria
- `PUT /categories/:id` - Atualiza uma categoria
- `DELETE /categories/:id` - Remove uma categoria

### Members
- `GET /members` - Lista todos os membros
- `POST /members` - Cria um novo membro
- `PUT /members/:id` - Atualiza um membro
- `DELETE /members/:id` - Remove um membro

### Transactions
- `GET /transactions` - Lista todas as transações
- `GET /transactions/:id` - Busca uma transação específica
- `POST /transactions` - Cria uma nova transação
- `PUT /transactions/:id` - Atualiza uma transação
- `DELETE /transactions/:id` - Remove uma transação

## Mapeamento de Dados

### TransactionType
- `0` = Income (Receita)
- `1` = Expense (Despesa)

### Formato da API vs Frontend

**API Transaction:**
```json
{
  "id": 1,
  "amount": 250.75,
  "description": "Supermercado Extra",
  "date": "2024-06-01",
  "transactionType": 1,
  "memberId": 1,
  "category": {
    "id": 5
  }
}
```

**Frontend Transaction:**
```typescript
{
  id: "1",
  type: "expense",
  amount: 250.75,
  category: "Alimentação",
  description: "Supermercado Extra",
  date: "2024-06-01",
  memberId: "1"
}
```

## Como Iniciar

### Opção 1: Modo Online (com API)

1. **Inicie o Backend Spring Boot**
```bash
# Na pasta do projeto Spring Boot
./mvnw spring-boot:run
# ou
java -jar target/seu-app.jar
```

O servidor deve estar rodando em `http://localhost:8080`

2. **Inicie o Frontend**
   - O aplicativo detectará automaticamente a API
   - Você verá uma notificação "Modo Online" e um badge verde no header
   - Todos os dados serão salvos no backend

### Opção 2: Modo Offline (sem API)

1. **Apenas inicie o Frontend**
   - O aplicativo detectará que a API não está disponível
   - Você verá uma notificação "Modo Offline" e um badge amarelo no header
   - Todos os dados serão salvos no localStorage do navegador
   - A aplicação funciona perfeitamente sem o backend

## Tratamento de Erros

Todos os métodos da API incluem tratamento de erros:
- Erros de rede são capturados e exibidos como toasts
- Logs de erro são enviados para o console
- A aplicação continua funcional mesmo se algumas chamadas falharem

## CORS

Certifique-se de que o backend está configurado para aceitar requisições do frontend:

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOrigins("http://localhost:*", "http://127.0.0.1:*")
                    .allowedMethods("GET", "POST", "PUT", "DELETE")
                    .allowedHeaders("*");
            }
        };
    }
}
```

## Categorias

O sistema gerencia categorias automaticamente:
- Quando uma transação é criada com uma categoria nova, ela é automaticamente criada na API
- As categorias são mantidas em cache local para melhorar a performance
- As listas estáticas `EXPENSE_CATEGORIES` e `INCOME_CATEGORIES` ainda existem para compatibilidade

## Desenvolvimento

### Testando a API

Você pode testar os endpoints usando:
- Postman (import o JSON fornecido)
- curl
- Qualquer cliente HTTP

### Exemplo com curl:

```bash
# Listar membros
curl http://localhost:8080/members

# Criar membro
curl -X POST http://localhost:8080/members \
  -H "Content-Type: application/json" \
  -d '{"name":"João Silva","role":"Pai"}'

# Listar transações
curl http://localhost:8080/transactions

# Criar transação
curl -X POST http://localhost:8080/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 150.00,
    "description": "Conta de luz",
    "date": "2024-10-28",
    "transactionType": 1,
    "memberId": 1,
    "category": {"id": 3}
  }'
```

## Detecção Automática de Modo

O aplicativo automaticamente:
1. Tenta conectar à API ao iniciar
2. Define o modo baseado na disponibilidade (timeout de 2 segundos)
3. Mostra uma notificação informando o modo ativo
4. Exibe um badge no header (verde = Online, amarelo = Offline)

## Troubleshooting

### "Failed to fetch" ou Modo Offline inesperado

**Solução 1**: Inicie o Backend
```bash
# Certifique-se que o Spring Boot está rodando
./mvnw spring-boot:run
```

**Solução 2**: Continue no Modo Offline
- O aplicativo funciona perfeitamente sem o backend
- Todos os dados ficam salvos no navegador
- Para migrar para o backend depois, use a interface para recriar os dados

### Erro de CORS
Se o backend está rodando mas ainda há erros, configure CORS:

```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**")
                    .allowedOrigins("*")
                    .allowedMethods("GET", "POST", "PUT", "DELETE")
                    .allowedHeaders("*");
            }
        };
    }
}
```

### Dados não aparecem
- **Modo Offline**: Dados estão no localStorage do navegador
- **Modo Online**: Verifique se há dados no banco de dados do backend
- Use as ferramentas de desenvolvedor (F12 > Network) para inspecionar requisições

## Migração de Dados

### Do localStorage para API
1. Exporte os dados manualmente (copie do localStorage)
2. Inicie o backend
3. Recarregue a página (entrará em Modo Online)
4. Recrie os dados pela interface

### Da API para localStorage
- Não é necessário, o fallback é automático
- Se a API falhar, o app usa dados locais automaticamente

## Próximos Passos

- [ ] Implementar autenticação JWT
- [ ] Adicionar paginação nas listagens
- [ ] Implementar filtros avançados no backend
- [ ] Adicionar cache mais robusto
- [ ] Implementar sincronização offline
