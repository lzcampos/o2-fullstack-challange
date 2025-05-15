import axios from 'axios';
import { config } from '../config';
import { ActionType, OllamaRequest, OllamaResponse, ParsedQuery } from '../types';

const api = axios.create({
  baseURL: config.ollama.apiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Check if the model is available 
 */
export async function checkModelAvailability(): Promise<boolean> {
  try {
    const response = await api.get('/api/tags');
    const models = response.data.models || [];
    
    // Log available models
    console.log('Available models:', models.map((m: any) => m.name).join(', '));
    
    // For models with tags like qwen3:0.6b, we need to check if any model starts with the prefix
    // Get the base model name (everything before the colon)
    const modelParts = config.ollama.model.split(':');
    const baseModelName = modelParts[0];
    const specificTag = modelParts.length > 1 ? modelParts[1] : '';
    
    // Option 1: The exact model name matches
    const exactMatch = models.some((model: any) => model.name === config.ollama.model);
    if (exactMatch) {
      return true;
    }
    
    // Option 2: If using a specific tag (like qwen3:0.6b), check if the base model exists
    // This might not be correct, as pulling qwen3 doesn't mean all variants are available
    // But we'll try to be accommodating
    if (specificTag && models.some((model: any) => model.name === baseModelName)) {
      console.log(`Found base model ${baseModelName}, but not specific tag ${specificTag}. Will attempt to use anyway.`);
      return true; 
    }
    
    // Nothing found
    console.log(`Model '${config.ollama.model}' not found among available models.`);
    return false;
  } catch (error) {
    console.error('Error checking model availability:', error);
    return false;
  }
}

/**
 * Send a query to the Ollama API
 */
export async function queryOllama(prompt: string): Promise<string> {
  try {
    // Ensure model is available
    const modelAvailable = await checkModelAvailability();
    if (!modelAvailable) {
      console.error(`Model '${config.ollama.model}' not found in Ollama. Try pulling it first.`);
      return `Erro: O modelo '${config.ollama.model}' não foi encontrado. Execute o comando "ollama pull ${config.ollama.model}" para baixá-lo.`;
    }

    const request: OllamaRequest = {
      model: config.ollama.model,
      prompt,
      options: {
        temperature: 0.7,
      },
      stream: true,
    };

    const response = await api.post('/api/generate', request, { responseType: 'stream' });
    let fullResponse = '';

    return await new Promise((resolve, reject) => {
      response.data.on('data', (chunk: Buffer) => {
        const lines = chunk.toString().split('\n').filter(Boolean);
        for (const line of lines) {
          try {
            const obj = JSON.parse(line);
            if (obj.response) fullResponse += obj.response;
            if (obj.done) resolve(fullResponse);
          } catch (e) {
            // Ignore parse errors for incomplete lines
          }
        }
      });
      response.data.on('end', () => resolve(fullResponse));
      response.data.on('error', reject);
    });
  } catch (error) {
    console.error('Error querying Ollama:', error);
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return `Erro: O modelo '${config.ollama.model}' não foi encontrado. Execute o comando "ollama pull ${config.ollama.model}" para baixá-lo.`;
    }
    throw new Error('Failed to query Ollama LLM');
  }
}

/**
 * Parse a natural language query to extract intent and parameters
 */
export async function parseQuery(query: string): Promise<ParsedQuery> {
  const prompt = `
Você é um agente de IA especializado em gerenciamento de estoque. 
Analise a seguinte consulta em português e extraia a intenção do usuário e os parâmetros relevantes:

"${query}"

Sua tarefa é identificar se a consulta se refere a uma destas ações:
1. getSales - Obter dados de vendas em um período
2. createStockMovement - Registrar uma nova movimentação de estoque

Responda APENAS com um JSON válido no seguinte formato:
{
  "intent": "nome_da_ação_ou_null",
  "params": {
    // Parâmetros extraídos
  }
}

Para getSales, os parâmetros possíveis são:
- start_date (formato YYYY-MM-DD)
- end_date (formato YYYY-MM-DD)
- product_id (número)

Para createStockMovement, os parâmetros possíveis são:
- product_id (número)
- quantity (número)
- movement_type ("in" para entrada, "out" para saída)
- notes (texto)

Para parâmetros de data, considere o mês atual como o mês de referência.
Se o usuário não especificar uma data, considere o mês atual, no ano atual. Estamos em Maio de 2025.

Exemplos de entradas e saídas esperadas:

Entrada: "Mostre as vendas totais do mês de janeiro"
Saída: {"intent":"getSales","params":{"start_date":"2023-01-01","end_date":"2023-01-31"}}

Entrada: "Registre uma entrada de 15 unidades do produto 5"
Saída: {"intent":"createStockMovement","params":{"product_id":5,"quantity":15,"movement_type":"in"}}
`;

  try {
    const response = await queryOllama(prompt);
    
    // Check if response contains error message
    if (response.startsWith('Erro:')) {
      throw new Error(response);
    }
    
    // Clean and extract JSON from response
    // First, find anything that looks like a valid JSON object
    const jsonRegex = /\{(?:[^{}]|(?:\{(?:[^{}]|(?:\{[^{}]*\}))*\}))*\}/g;
    const jsonMatches = response.match(jsonRegex);
    
    if (!jsonMatches || jsonMatches.length === 0) {
      console.error('Failed to extract JSON. Raw response:', response);
      throw new Error('Failed to extract JSON from LLM response');
    }
    
    // Try parsing each match until we find a valid JSON with the expected structure
    let parsedJson = null;
    for (const match of jsonMatches) {
      try {
        const parsed = JSON.parse(match);
        // Check if this has the structure we expect
        if (typeof parsed === 'object' && ('intent' in parsed)) {
          parsedJson = parsed;
          break;
        }
      } catch (e) {
        // Continue to the next match
        console.warn('Failed to parse potential JSON match:', match);
      }
    }
    
    if (!parsedJson) {
      console.error('No valid JSON with intent field found. Raw response:', response);
      throw new Error('No valid JSON structure found in response');
    }
    
    return {
      intent: parsedJson.intent as ActionType | null,
      params: parsedJson.params || {},
      rawQuery: query,
    };
  } catch (error) {
    console.error('Error parsing query:', error);
    if (error instanceof Error && error.message.startsWith('Erro:')) {
      return {
        intent: null,
        params: {},
        rawQuery: query,
        error: error.message
      };
    }
    return {
      intent: null,
      params: {},
      rawQuery: query,
    };
  }
}

/**
 * Generate a human-friendly response based on the query result
 */
export async function generateResponse(query: string, result: any): Promise<string> {
  const prompt = `
Você é um assistente de IA para um sistema de gerenciamento de estoque. 
O usuário fez a seguinte consulta:

"${query}"

E o sistema retornou o seguinte resultado:

${JSON.stringify(result, null, 2)}

Por favor, formate uma resposta em português claro e conciso que explique os resultados de forma amigável.
Não mencione detalhes técnicos sobre JSON ou formato de dados.
Para consultas de vendas, os valores retornados vão conter as seguintes chaves (exiba TODAS na resposta):
- total_in - é a quantidade de entradas em unidades
- total_out - é a quantidade de saídas em unidades
- total_in_value - é o valor total das entradas
- total_out_value - é o valor total das saídas
Tente ser útil e profissional. Se for uma consulta de vendas, mencione os totais. 
Valores monetários retornados estarão em centavos de reais, formate-os para reais com duas casas decimais após dividir por 100, por exemplo: se o sistema retornar 10000, formate para R$ 100,00.
Se for uma movimentação de estoque, confirme o que foi feito.
`;

  try {
    console.log('Generating response with query:', query);
    const response = await queryOllama(prompt);
    
    // Check if response contains error message
    if (response.startsWith('Erro:')) {
      return response;
    }
    
    // Clean up the response - remove any model-generated code blocks or similar artifacts
    let cleanResponse = response;
    
    // Remove markdown code blocks if present
    cleanResponse = cleanResponse.replace(/```json[\s\S]*?```/g, '');
    cleanResponse = cleanResponse.replace(/```[\s\S]*?```/g, '');
    
    // Remove any trailing JSON-like content that might be added
    const jsonStart = cleanResponse.indexOf('{');
    const jsonEnd = cleanResponse.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
      // Check if this looks like a full message followed by a JSON
      const beforeJson = cleanResponse.substring(0, jsonStart).trim();
      if (beforeJson.length > 20) {  // Minimum text length to consider it an actual message
        cleanResponse = beforeJson;
      }
    }
    
    return cleanResponse.trim();
  } catch (error) {
    console.error('Error generating response:', error);
    if (error instanceof Error && error.message.startsWith('Erro:')) {
      return error.message;
    }
    return 'Desculpe, não consegui processar sua solicitação. Por favor, tente novamente.';
  }
} 