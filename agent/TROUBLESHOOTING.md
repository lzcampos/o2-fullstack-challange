# Guia de Solução de Problemas

Este guia aborda os problemas mais comuns que podem ocorrer ao iniciar e usar o Agente de IA.

## Problemas com Docker e Ollama

### 1. Erro: "container ollama is unhealthy"

**Sintoma:** Ao executar `docker-compose up -d`, você recebe o erro:
```
dependency failed to start: container agent-ollama-1 is unhealthy
```

**Solução:**
1. Use o script de inicialização alternativo que inicia os containers sequencialmente:
   ```bash
   ./scripts/start-docker.sh
   ```

2. Se o problema persistir, verifique os logs do Ollama:
   ```bash
   docker-compose logs ollama
   ```

3. Tente aumentar a memória disponível para o Docker nas configurações do Docker Desktop.

### 2. Erro: "model 'stockagent' not found"

**Sintoma:** O agente responde com mensagens de erro indicando que o modelo não foi encontrado.

**Solução:**
1. Verifique se o modelo está disponível:
   ```bash
   ./scripts/check-models.sh
   ```

2. Se o modelo não estiver disponível, crie-o manualmente:
   ```bash
   ./scripts/create-model.sh
   ```

3. Se estiver usando Docker, você pode criar o modelo diretamente no container:
   ```bash
   cat Modelfile | docker-compose exec -T ollama ollama create stockagent -
   ```

### 3. Erro de Download do Modelo Base

**Sintoma:** O Ollama não consegue baixar o modelo base Mistral.

**Solução:**
1. Verifique sua conexão com a internet
   
2. Verifique o espaço disponível em disco

3. Tente baixar o modelo manualmente:
   ```bash
   docker-compose exec ollama ollama pull mistral
   ```

4. Depois de baixar o modelo base, crie o modelo personalizado:
   ```bash
   cat Modelfile | docker-compose exec -T ollama ollama create stockagent -
   ```

### 4. Problemas de Rede com Docker

**Sintoma:** O container do agente não consegue se comunicar com o Ollama ou com o backend.

**Solução:**
1. Verifique se ambos os containers estão rodando:
   ```bash
   docker-compose ps
   ```

2. Se os containers estiverem rodando mas não se comunicando, verifique as configurações de rede:
   ```bash
   docker network ls
   docker network inspect agent_default
   ```

3. Para problemas com a conexão ao backend, certifique-se de que você está usando `host.docker.internal` para acessar serviços no host.

## Problemas com o Modelo de Linguagem

### 1. Respostas Lentas

**Sintoma:** O agente demora muito para responder às consultas.

**Solução:**
- A primeira consulta após iniciar o Ollama é normalmente mais lenta pois o modelo está sendo carregado
- Verifique se o seu computador tem memória RAM suficiente (mínimo 8GB recomendado)
- Considere ajustar os parâmetros do modelo no Modelfile (diminuir valores como top_k)

### 2. Respostas Inadequadas

**Sintoma:** O agente não entende corretamente a consulta ou fornece respostas incorretas.

**Solução:**
- Certifique-se de usar consultas claras e precisas
- Você pode ajustar o sistema prompt no Modelfile para melhorar a compreensão do domínio
- Use os exemplos de consulta fornecidos para referência
- Para consultas que incluem datas, use o formato YYYY-MM-DD

## Problemas com o Backend

### 1. Erro de Conexão com o Backend

**Sintoma:** O agente não consegue se conectar ao backend, retornando erros.

**Solução:**
1. Verifique se o servidor backend está rodando:
   ```bash
   curl http://localhost:3000/health
   ```

2. Se o backend estiver rodando em um container Docker diferente, ajuste a URL do backend no arquivo `.env`:
   ```
   BACKEND_API_URL=http://backend:3000
   ```

3. Verifique se não há problemas de CORS no backend.

## Reiniciar Tudo

Se você estiver enfrentando problemas persistentes, pode ser útil reiniciar tudo do zero:

```bash
# Parar e remover todos os containers
docker-compose down

# Remover volumes (isso excluirá os modelos baixados)
docker-compose down -v

# Limpar o cache do Docker
docker system prune -f

# Iniciar novamente usando o script
./scripts/start-docker.sh
``` 