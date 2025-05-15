# Sistema de Gerenciamento de Estoque com IA

Um sistema para gestão de estoque com backend, frontend e um agente de IA para consultas em linguagem natural.

Como LLM, usei o modelo Qween3:0.6b. É um modelo bem "pequeno", e o motivo dessa escolha é que preciso rodar todos os cálculos na CPU (e não na GPU).

Se você quiser usar outro modelo mais robusto, rodando na GPU, provavelmente basta trocar os valores de configuração no projeto do agente (variáveis de configuração, dockerfile, etc.)!

## Arquitetura do Sistema

O sistema é composto por três serviços principais:

1. **Backend API**: Responsável por gerenciar dados de produtos, estoque e movimentações
2. **Frontend**: Interface de usuário para visualização e controle do estoque
3. **Agente IA**: Serviço para processar consultas em linguagem natural sobre estoque e vendas

## Tecnologias Utilizadas

### Backend
- **Linguagem**: TypeScript/Node.js
- **Framework**: Express
- **Database**: PostgreSQL
- **ORM**: Knex.js

### Frontend
- **Framework**: React
- **UI Library**: Material UI
- **Gráficos**: Chart.js
- **Gerenciamento de Estado**: React Context API

### Agente IA
- **Linguagem**: TypeScript/Node.js
- **Framework**: Express
- **Modelo de IA**: Qwen3 via Ollama
- **Processamento de Linguagem Natural**: Utiliza o modelo Qwen3:0.6b para interpretação de comandos

## Como Iniciar

### Método Simples (Docker Compose)

Utilizando o script de inicialização:

```bash
# Tornar o script executável (se necessário)
chmod +x start.sh

# Iniciar todos os serviços
./start.sh
```

Este script:
1. Para containers existentes
2. Inicia todos os serviços via Docker Compose
3. Mostra URLs para acessar os diferentes componentes

### Inicialização Manual

```bash
# Iniciar todos os serviços com Docker Compose
docker-compose up -d

# Iniciar apenas o backend
docker-compose up -d backend

# Iniciar apenas o frontend
docker-compose up -d frontend

# Iniciar apenas o agente IA com Ollama
docker-compose up -d ollama agent
```

### Configuração do Banco de Dados

O banco de dados PostgreSQL é inicializado automaticamente com as tabelas necessárias através de dois mecanismos:

1. **Scripts de Inicialização**: O arquivo `backend/init-scripts/init.sql` é executado quando o container do PostgreSQL é iniciado pela primeira vez, criando as tabelas básicas e funções necessárias.

2. **Migrações e Seeds**: Quando o backend inicia, ele executa:
   - `npm run migrate` - Para aplicar as migrações pendentes usando Knex
   - `npm run seed` - Para popular o banco de dados com dados iniciais

Este processo garante que o banco de dados esteja sempre no estado correto e com dados de exemplo para testes.

## Acessando os Serviços

- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **Agente IA**: http://localhost:3003
- **Ollama API**: http://localhost:11434

## Endpoints da API

### Backend API

#### Produtos

- `GET /api/products` - Lista todos os produtos
- `GET /api/products/:id` - Obtém um produto específico
- `POST /api/products` - Cria um novo produto
- `PUT /api/products/:id` - Atualiza um produto
- `DELETE /api/products/:id` - Remove um produto

#### Movimentações de Estoque

- `GET /api/stock-movements` - Lista todas as movimentações
- `GET /api/stock-movements/:id` - Obtém uma movimentação específica
- `POST /api/stock-movements` - Registra uma nova movimentação
- `GET /api/stock-movements/popular` - Lista produtos mais populares

#### Métricas

- `GET /api/metrics/summary` - Resumo geral (valores em estoque, vendas)
- `GET /api/metrics/stock-movements` - Dados de movimentação de estoque

### Agente IA API

- `POST /api/query` - Processa consultas em linguagem natural
  ```json
  {
    "query": "Mostrar vendas totais do mês atual"
  }
  ```

## Funcionalidades do Agente IA

O agente IA pode processar dois tipos principais de comandos:

### 1. Consulta de Vendas (`getSales`)

Exemplos de comandos:
- "Mostrar vendas totais do mês atual"
- "Mostrar vendas do produto 1"
- "Mostrar vendas de janeiro"

### 2. Registro de Movimentações (`createStockMovement`)

Exemplos de comandos:
- "Registrar entrada de 10 unidades do produto 2"
- "Registrar saída de 5 unidades do produto 3"
- "Adicionar 20 unidades do produto 1 ao estoque"

## Interface do Usuário

O frontend possui as seguintes seções:

1. **Dashboard**: Visão geral do estoque e vendas
2. **Produtos**: Gerenciamento de produtos
3. **Estoque**: Movimentações e status atual
4. **Chat IA**: Assistente virtual para consultas via chat

## Troubleshooting

### Container Ollama Não Inicializa

Se o container Ollama não inicializar corretamente:

```bash
# Verificar logs
docker-compose logs ollama

# Verificar se o Ollama tem memória suficiente
# Edite docker-compose.yml para ajustar recursos se necessário
```

### Modelo Qwen3 Não Carrega

```bash
# Verificar status dos modelos
docker-compose exec ollama ollama list

# Baixar o modelo manualmente
docker-compose exec ollama ollama pull qwen3:0.6b
```

### Backend não conecta ao banco de dados

```bash
# Verificar logs
docker-compose logs backend

# Verificar se o PostgreSQL está rodando
docker-compose ps db

# Acessar o banco de dados diretamente
docker-compose exec db psql -U postgres -d stock_management

# Reiniciar o processo de migração manualmente
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed
```

### Problemas com Migrações ou Seeds

```bash
# Verificar logs específicos das migrações
docker-compose logs backend | grep migrate

# Reimplantar o banco de dados do zero
docker-compose down -v  # Remove volumes
docker-compose up -d db # Inicia apenas o banco
docker-compose up -d    # Inicia os demais serviços
```

## Desenvolvimento

### Estrutura do Projeto

```
.
├── agent/               # Código do agente IA
├── backend/             # Código do backend
│   ├── init-scripts/    # Scripts SQL para inicialização do banco
│   ├── migrations/      # Migrações Knex
│   └── seeds/           # Seeds para popular o banco de dados
├── frontend/            # Código do frontend
├── docker-compose.yml   # Configuração Docker Compose
└── start.sh             # Script de inicialização
```

### Desenvolvimento Local (Sem Docker)

Para desenvolver localmente sem Docker, cada serviço pode ser iniciado separadamente:

#### Backend
```bash
cd backend
npm install
npm run migrate
npm run seed
npm run dev
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

#### Agent
```bash
cd agent
npm install
npm run dev

# Em outra janela do terminal
ollama run qwen3:0.6b
```

## Licença

MIT