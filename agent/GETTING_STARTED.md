# Guia de Inicialização Rápida do Agente de IA

Este guia explica como iniciar e testar o Agente de IA para o sistema de gerenciamento de estoque.

## Pré-requisitos

Certifique-se de que você tem:

- Docker e Docker Compose instalados
- Node.js (v14+)
- npm ou yarn
- O servidor de backend rodando na porta 3000

## Passos para Iniciar

### 1. Iniciar o Ollama e o Agente com Docker

O método mais fácil é usar o Docker Compose:

```bash
# Na pasta do agente
cd agent

# Iniciar os containers
docker-compose up -d
```

Isso iniciará:
- Container do Ollama na porta 11434
- Container do Agente na porta 3002

### 2. Iniciar o Ollama e o Agente Manualmente

Alternativamente, você pode iniciar os componentes manualmente:

```bash
# Na pasta do agente
cd agent

# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Iniciar o Ollama em um terminal separado
docker run -p 11434:11434 ollama/ollama

# Em outro terminal, puxar o modelo Mistral
./scripts/pull-model.sh

# Compilar e iniciar o agente
npm run build
npm start
```

## Testar o Agente

### Usando o Script de Teste Interativo

```bash
# Após iniciar o agente
cd agent
npm run build
node dist/test-agent.js
```

Este script interativo permitirá que você escolha exemplos pré-definidos ou digite suas próprias consultas.

### Usando o Cliente HTTP Simples

```bash
# Na pasta do agente
cd agent
node test-http.js

# Para testar a segunda consulta de exemplo
node test-http.js 1
```

### Usando cURL

```bash
# Consultar vendas totais
curl -X POST http://localhost:3002/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Mostrar vendas totais do mês atual"}'

# Registrar uma entrada de estoque
curl -X POST http://localhost:3002/api/query \
  -H "Content-Type: application/json" \
  -d '{"query": "Registrar entrada de 10 unidades do produto 2"}'
```

## Exemplos de Consultas

O agente suporta consultas como:

### Consultas de Vendas
- "Mostrar vendas totais do mês atual"
- "Obter vendas totais do produto 5"
- "Qual foi o total de vendas entre 01/01/2023 e 31/01/2023?"

### Movimentações de Estoque
- "Registrar entrada de 10 unidades do produto 2"
- "Adicionar 15 unidades do produto 3 ao estoque"
- "Registrar saída de 5 unidades do produto 1 como venda"

## Solução de Problemas Comuns

- **Erro de conexão com Ollama**: Certifique-se de que o Ollama está rodando na porta 11434
- **Erro de conexão com o backend**: Verifique se o servidor backend está ativo na porta 3000
- **Tempo de resposta longo**: O primeiro uso do modelo Mistral pode ser mais lento devido ao carregamento
- **Formato incorreto de datas**: Use o formato YYYY-MM-DD nas consultas para melhores resultados 