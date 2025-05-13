import { StockService } from './StockService';
import * as dateUtils from '../utils/dateUtils';
import { InferenceClient } from '@huggingface/inference';

// Possible command types
export enum CommandType {
  GET_TOTAL_SALES = 'GET_TOTAL_SALES',
  GET_POPULAR_ITEMS = 'GET_POPULAR_ITEMS',
  GET_STOCK = 'GET_STOCK',
  GET_METRICS = 'GET_METRICS',
  REGISTER_MOVEMENT = 'REGISTER_MOVEMENT',
  UNKNOWN = 'UNKNOWN'
}

// Command parameters that can be extracted
export interface CommandParams {
  period?: { startDate?: string, endDate?: string };
  productId?: number;
  category?: string;
  movementType?: 'in' | 'out';
  quantity?: number;
}

// Simple rule-based patterns for command recognition as a fallback
const COMMAND_PATTERNS = {
  [CommandType.GET_TOTAL_SALES]: [
    'vendas', 'faturamento', 'total de vendas', 'mostrar vendas', 'consultar vendas',
    'quanto foi vendido', 'ver vendas'
  ],
  [CommandType.GET_POPULAR_ITEMS]: [
    'populares', 'mais vendidos', 'produtos populares', 'itens populares',
    'melhores vendas', 'produtos mais vendidos'
  ],
  [CommandType.GET_STOCK]: [
    'estoque', 'inventário', 'produtos disponíveis', 'mostrar estoque',
    'ver estoque', 'produtos em estoque', 'consultar estoque'
  ],
  [CommandType.GET_METRICS]: [
    'métricas', 'estatísticas', 'resumo', 'dashboard', 'indicadores',
    'desempenho', 'números', 'resultados'
  ],
  [CommandType.REGISTER_MOVEMENT]: [
    'registrar', 'adicionar', 'movimentação', 'entrada', 'saída',
    'novo movimento', 'nova entrada', 'nova saída', 'registrar movimento'
  ]
};

export class NLPService {
  private stockService: StockService;
  private hf: InferenceClient;
  
  // Use a free text generation model from Hugging Face
  private MODEL_ID = 'google/flan-t5-small';
  
  constructor(stockService: StockService) {
    this.stockService = stockService;
    
    // Initialize the Hugging Face client
    // The API token is passed directly as first parameter
    this.hf = new InferenceClient(process.env.HUGGINGFACE_API_TOKEN || '');
  }

  public async processQuery(query: string): Promise<any> {
    try {
      // Try to extract intent using LLM
      let commandType: CommandType;
      let params: CommandParams = {};
      
      try {
        // First try to use the LLM for intent recognition
        const { recognizedCommand, extractedParams } = await this.extractIntentWithLLM(query);
        commandType = recognizedCommand;
        
        // If we get a valid command from the LLM, use those params
        if (commandType !== CommandType.UNKNOWN) {
          params = { ...extractedParams };
        }
      } catch (llmError) {
        console.error('LLM processing failed, falling back to rule-based approach:', llmError);
        // If LLM fails, fall back to pattern matching
        commandType = this.identifyCommandTypeFromPatterns(query);
      }
      
      // Always extract parameters using rule-based approach for reliability
      // This ensures we get parameters even if LLM doesn't extract them
      const ruleBasedParams = this.extractParametersWithRules(query);
      
      // Merge the params, prioritizing any params we got from rules
      params = { ...params, ...ruleBasedParams };
      
      console.log(`Identified command: ${commandType}`, params);
      
      // Execute the identified command
      return this.executeCommand(commandType, params);
    } catch (error) {
      console.error('Error processing query:', error);
      return {
        error: "Erro ao processar sua consulta. Por favor, tente novamente."
      };
    }
  }

  private identifyCommandTypeFromPatterns(query: string): CommandType {
    // Normalize the query
    const normalizedQuery = this.normalizeText(query);
    
    // Check for matches in our pattern dictionary
    for (const [cmdType, patterns] of Object.entries(COMMAND_PATTERNS)) {
      for (const pattern of patterns) {
        if (normalizedQuery.includes(pattern)) {
          return cmdType as CommandType;
        }
      }
    }
    
    // Try to make an educated guess based on keywords
    if (normalizedQuery.includes('vend') || normalizedQuery.includes('fatur')) {
      return CommandType.GET_TOTAL_SALES;
    } else if (normalizedQuery.includes('popular') || normalizedQuery.includes('melhor')) {
      return CommandType.GET_POPULAR_ITEMS;
    } else if (normalizedQuery.includes('estoq') || normalizedQuery.includes('produt')) {
      return CommandType.GET_STOCK;
    } else if (normalizedQuery.includes('metric') || normalizedQuery.includes('resumo')) {
      return CommandType.GET_METRICS;
    } else if (normalizedQuery.includes('registr') || normalizedQuery.includes('moviment')) {
      return CommandType.REGISTER_MOVEMENT;
    }
    
    return CommandType.UNKNOWN;
  }
  
  private normalizeText(text: string): string {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // Remove accents
  }
  
  private async extractIntentWithLLM(query: string): Promise<{ 
    recognizedCommand: CommandType, 
    extractedParams: CommandParams 
  }> {
    try {
      // Create a prompt that instructs the model to classify the query and extract parameters
      const prompt = `
      Classify the following Portuguese query into one of these categories:
      - GET_TOTAL_SALES (for queries about sales data, revenue)
      - GET_POPULAR_ITEMS (for queries about popular or best-selling products)
      - GET_STOCK (for queries about inventory or product stock)
      - GET_METRICS (for queries about metrics or statistics)
      - REGISTER_MOVEMENT (for requests to register stock movement)
      - UNKNOWN (if none of the above)

      Query: "${query}"

      Answer with only the category name.
      `;

      // Call the Hugging Face model
      const result = await this.hf.textGeneration({
        model: this.MODEL_ID,
        inputs: prompt,
        parameters: {
          max_new_tokens: 20,
          temperature: 0.1, // Low temperature for more predictable outputs
        }
      });

      // Extract the recognized command from the response
      const generatedText = result.generated_text || '';
      let recognizedCommand = CommandType.UNKNOWN;
      
      // Look for command type in the response
      for (const cmdType of Object.values(CommandType)) {
        if (generatedText.includes(cmdType)) {
          recognizedCommand = cmdType;
          break;
        }
      }

      // Extract parameters via rule-based methods (more reliable than LLM for structured data)
      const extractedParams = this.extractParametersWithRules(query);

      return { recognizedCommand, extractedParams };
    } catch (error) {
      console.error('Error with LLM intent extraction:', error);
      // Return unknown command if LLM fails
      return { 
        recognizedCommand: CommandType.UNKNOWN, 
        extractedParams: {} 
      };
    }
  }

  private extractParametersWithRules(query: string): CommandParams {
    const params: CommandParams = {};
    
    // Extract period
    params.period = this.extractPeriod(query);
    
    // Extract product ID using regex
    const productIdMatch = query.match(/produto\s+(\d+)|id\s+(\d+)|produto\s+id\s+(\d+)|item\s+(\d+)/i);
    if (productIdMatch) {
      // Find the first non-undefined group
      for (let i = 1; i < productIdMatch.length; i++) {
        if (productIdMatch[i]) {
          params.productId = parseInt(productIdMatch[i], 10);
          break;
        }
      }
    }
    
    // Extract category
    const categoryMatch = query.match(/categoria\s+([a-zA-Z]+)|categorias\s+([a-zA-Z]+)|tipo\s+([a-zA-Z]+)/i);
    if (categoryMatch) {
      // Find the first non-undefined group
      for (let i = 1; i < categoryMatch.length; i++) {
        if (categoryMatch[i]) {
          params.category = categoryMatch[i];
          break;
        }
      }
    }
    
    // Extract movement type
    if (query.includes('entrada') || query.includes('adicionar')) {
      params.movementType = 'in';
    } else if (query.includes('saida') || query.includes('venda') || query.includes('sair')) {
      params.movementType = 'out';
    }
    
    // Extract quantity
    const quantityMatch = query.match(/(\d+)\s+unidades|quantidade\s+(\d+)|(\d+)\s+itens|(\d+)\s+produtos/i);
    if (quantityMatch) {
      // Find the first non-undefined group
      for (let i = 1; i < quantityMatch.length; i++) {
        if (quantityMatch[i]) {
          params.quantity = parseInt(quantityMatch[i], 10);
          break;
        }
      }
    }
    
    return params;
  }
  
  private extractPeriod(query: string): { startDate?: string, endDate?: string } | undefined {
    const period: { startDate?: string, endDate?: string } = {};
    
    // Handle specific date mentions using our utility functions
    if (query.includes('hoje')) {
      const today = dateUtils.getToday();
      period.startDate = today;
      period.endDate = today;
    } else if (query.includes('esta semana') || query.includes('semana atual')) {
      period.startDate = dateUtils.getCurrentWeekStart();
      period.endDate = dateUtils.getToday();
    } else if (query.includes('este mes') || query.includes('mes atual')) {
      period.startDate = dateUtils.getCurrentMonthStart();
      period.endDate = dateUtils.getToday();
    } else if (query.includes('ultimo mes') || query.includes('mes passado')) {
      period.startDate = dateUtils.getPreviousMonthStart();
      period.endDate = dateUtils.getPreviousMonthEnd();
    } else if (query.includes('este ano') || query.includes('ano atual')) {
      period.startDate = dateUtils.getCurrentYearStart();
      period.endDate = dateUtils.getToday();
    } else {
      // Extract specific date ranges using regex
      const dateRegex = /(\d{2}\/\d{2}\/\d{4})/g;
      const dates = query.match(dateRegex);
      if (dates && dates.length >= 1) {
        if (dates.length >= 2) {
          period.startDate = dateUtils.convertDateFormat(dates[0]);
          period.endDate = dateUtils.convertDateFormat(dates[1]);
        } else {
          // If only one date is mentioned, assume it's the start date
          period.startDate = dateUtils.convertDateFormat(dates[0]);
        }
      } else {
        // No period found
        return undefined;
      }
    }
    
    return period;
  }

  private async executeCommand(commandType: CommandType, params: CommandParams): Promise<any> {
    const { period, productId, category, movementType, quantity } = params;

    switch (commandType) {
      case CommandType.GET_TOTAL_SALES:
        return this.stockService.getTotalSales(
          period?.startDate, 
          period?.endDate, 
          productId, 
          category
        );
      
      case CommandType.GET_POPULAR_ITEMS:
        return this.stockService.getPopularItems();
      
      case CommandType.GET_STOCK:
        if (productId) {
          return this.stockService.getProductStock(productId);
        }
        return this.stockService.getCurrentStock();
      
      case CommandType.GET_METRICS:
        return this.stockService.getMetricsSummary(period?.startDate, period?.endDate);
      
      case CommandType.REGISTER_MOVEMENT:
        if (!productId || !quantity || !movementType) {
          return {
            error: "Informações incompletas para registrar movimento. Necessário: ID do produto, quantidade e tipo de movimento (entrada/saída)."
          };
        }
        return this.stockService.registerMovement(productId, quantity, movementType);
      
      default:
        return {
          error: "Não foi possível entender sua solicitação. Por favor, tente novamente com um comando mais específico."
        };
    }
  }
} 