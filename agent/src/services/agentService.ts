import { AgentQuery, AgentResponse, ActionType, StockMovementInput } from '../types';
import * as backendService from './backendService';
import * as ollamaService from './ollamaService';

// Type guard to check if parsedQuery has an error property
function hasError(obj: any): obj is { error: string } {
  return obj && typeof obj.error === 'string';
}

/**
 * Process a natural language query and perform appropriate actions
 */
export async function processQuery(query: AgentQuery): Promise<AgentResponse> {
  try {
    // Parse the query to extract intent and parameters
    const parsedQuery = await ollamaService.parseQuery(query.query);
    
    // Check if there was an error with the model
    if (hasError(parsedQuery)) {
      return {
        response: parsedQuery.error,
        action: 'error',
      };
    }

    if (!parsedQuery.intent) {
      return {
        response: 'Desculpe, não entendi o que você deseja. Por favor, tente reformular sua consulta.',
        action: 'unknown',
      };
    }
    
    let result;
    
    // Execute the appropriate action based on intent
    switch (parsedQuery.intent) {
      case 'getSales':
        result = await backendService.getSales(parsedQuery.params);
        break;
        
      case 'createStockMovement':
        // Validate necessary parameters
        if (!parsedQuery.params.product_id || !parsedQuery.params.quantity || !parsedQuery.params.movement_type) {
          return {
            response: 'Faltam informações necessárias para registrar a movimentação de estoque. Por favor, forneça o ID do produto, quantidade e tipo de movimento (entrada ou saída).',
            action: 'error',
          };
        }
        
        // Get product details to include in the response
        const product = await backendService.getProductById(parsedQuery.params.product_id);
        
        // Create the stock movement
        const stockMovementInput: StockMovementInput = {
          product_id: parsedQuery.params.product_id,
          quantity: parsedQuery.params.quantity,
          movement_type: parsedQuery.params.movement_type,
          notes: parsedQuery.params.notes || 'Registrado via agente de IA',
        };
        
        result = await backendService.createStockMovement(stockMovementInput);
        
        // Add product information to the result
        result = {
          ...result,
          product,
        };
        break;
        
      default:
        return {
          response: 'Desculpe, essa operação não é suportada no momento.',
          action: 'unsupported',
        };
    }
    
    // Generate a user-friendly response
    const response = await ollamaService.generateResponse(parsedQuery.rawQuery, result);
    
    // Check if the response indicates an error with the model
    if (typeof response === 'string' && response.startsWith('Erro:')) {
      return {
        response,
        action: 'error',
      };
    }
    
    return {
      response,
      action: parsedQuery.intent,
      data: result,
    };
  } catch (error) {
    console.error('Error processing query:', error);
    return {
      response: 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.',
      action: 'error',
    };
  }
} 