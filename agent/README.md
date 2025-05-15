# Agente de IA para Gerenciamento de Estoque

Um agente de inteligência artificial que processa consultas em linguagem natural para obter dados de vendas e realizar movimentações de estoque.

## Funcionalidades

- Consultar vendas totais em um período específico
- Registrar novas movimentações de estoque (entradas e saídas)
- Processamento de linguagem natural em português
- Integração com API de backend para operações de estoque

## Tecnologias Utilizadas

- Node.js com TypeScript
- Express para o servidor API
- Ollama com modelo personalizado baseado em Mistral para processamento de linguagem natural
- Docker para containerização

## Requisitos

- Docker e Docker Compose
- Node.js (v14+)
- npm ou yarn

## Modelo de IA Personalizado

Este agente utiliza um **modelo personalizado** baseado no Mistral através do Ollama. O modelo é criado automaticamente durante a inicialização dos containers Docker, usando o `Modelfile` incluído.

Para criar o modelo manualmente:

```bash
./scripts/create-model.sh
```

Para verificar os modelos disponíveis:

```bash
./scripts/check-models.sh
```

## Configuração e Instalação

### 1. Configuração do Ambiente

Copie o arquivo de exemplo de ambiente e ajuste conforme necessário:

```bash
cp .env.example .env
```

### 2. Iniciando com Docker

**Método Recomendado**:

Usamos um script especial para iniciar os containers na ordem correta e garantir que o Ollama esteja pronto antes de iniciar o agente:

```bash
./scripts/start-docker.sh
```

Este script:
1. Para todos os containers existentes
2. Inicia apenas o container Ollama
3. Aguarda a inicialização completa do Ollama (60 segundos)
4. Cria o modelo personalizado baseado no Modelfile
5. Inicia o container do agente

**Método Alternativo**:

Se preferir usar o Docker Compose diretamente:

```bash
docker-compose up -d
```

Isso iniciará:
- Container Ollama: Rodando na porta 11434
- Container do Agente: Rodando na porta 3003

> **Nota**: O Docker Compose está configurado para criar o modelo personalizado automaticamente. A primeira inicialização pode demorar alguns minutos enquanto o modelo Mistral é baixado.

### 3. Instalação Manual (Desenvolvimento)

Se preferir rodar localmente:

```bash
# Instalar dependências
npm install

# Copiar arquivo de ambiente
cp .env.example .env

# Iniciar o Ollama em um terminal separado
docker run -p 11434:11434 ollama/ollama

# Em outro terminal, criar o modelo personalizado
./scripts/create-model.sh

# Compilar o código TypeScript
npm run build

# Iniciar o servidor
npm start

# Alternativamente, para desenvolvimento com hot reload
npm run dev
```

**Nota:** Você precisa garantir que o modelo personalizado esteja disponível no Ollama antes de iniciar o agente.

## Uso do Agente

O agente expõe um endpoint API que aceita consultas em linguagem natural:

- **Endpoint:** `POST /api/query`
- **Formato do corpo da requisição:**
  ```json
  {
    "query": "Sua consulta em linguagem natural aqui"
  }
  ```
- **Formato da resposta:**
  ```json
  {
    "response": "Resposta em linguagem natural",
    "action": "Ação executada pelo agente",
    "data": { ... } // Dados retornados, quando aplicável
  }
  ```

### Exemplos de Consultas

- "Mostrar vendas totais do mês atual"
- "Obter vendas totais do produto 5"
- "Ver produtos mais populares"
- "Mostrar estoque atual"
- "Registrar entrada de 10 unidades do produto 2"
- "Registrar saída de 5 unidades do produto 3 como venda"

### Testando o Agente

Incluímos um script de teste para facilitar a interação com o agente:

```bash
# Compilar o código primeiro se ainda não o tiver feito
npm run build

# Executar o script de teste interativo
npm run test:client

# Ou usando o cliente HTTP simples
npm run test:http
```

O script permite escolher entre exemplos pré-definidos ou inserir suas próprias consultas.

## Arquitetura

O agente é composto por:

1. **API Express**: Recebe e responde às consultas
2. **Serviço de Análise NLP**: Interpreta consultas em linguagem natural
3. **Serviço de Backend**: Comunica-se com a API do sistema de estoque
4. **Ollama com Modelo Personalizado**: Modelo customizado para o domínio de gerenciamento de estoque

## Solução de Problemas

- **Erro "model 'stockagent' not found"**: O modelo personalizado não foi criado. Execute:
  ```bash
  ./scripts/create-model.sh
  ```

- **Erro "container is unhealthy"**: Pode ocorrer se o Ollama não inicializar corretamente. Use o script alternativo:
  ```bash
  ./scripts/start-docker.sh
  ```

- **Erro de conexão com Ollama**: Verifique se o container Ollama está rodando:
  ```bash
  docker ps | grep ollama
  ```

- **Erro de conexão com o Backend**: Verifique se o servidor backend está rodando na porta 3000

- **Tempo de resposta longo**: O primeiro uso do modelo pode ser mais lento devido ao carregamento

- **Formato incorreto de datas**: Use o formato YYYY-MM-DD nas consultas para melhores resultados

Para informações mais detalhadas sobre solução de problemas, consulte o arquivo [TROUBLESHOOTING.md](./TROUBLESHOOTING.md).
