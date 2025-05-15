import axios from 'axios';

const API_URL = process.env.REACT_APP_AGENT_API_URL || 'http://localhost:3003';

export interface QueryResult {
  message: string;
  data: any;
  action?: string;
  query: string;
}

export interface AgentExample {
  command: string;
  description: string;
}

/**
 * Service for interacting with the AI Agent API
 */
class AIAgentService {
  /**
   * Send a natural language query to the AI agent
   * @param query Natural language query in Portuguese
   */
  async sendQuery(query: string): Promise<QueryResult> {
    try {
      const response = await axios.post(`${API_URL}/api/query`, { query });
      
      // Format the response from our new agent API to match the expected format
      return {
        message: response.data.response,
        data: response.data.data || {},
        action: response.data.action || 'unknown',
        query: query
      };
    } catch (error) {
      console.error('Error sending query to AI agent:', error);
      throw error;
    }
  }

  /**
   * Get example commands that can be used with the AI agent
   */
  async getExamples(): Promise<AgentExample[]> {
    // Examples aligned with agent's capabilities (getSales and createStockMovement)
    const examples: AgentExample[] = [
      { command: "Mostrar vendas totais do mês atual", description: "getSales" },
      { command: "Mostrar vendas do produto 1", description: "getSales" },
      { command: "Mostrar vendas de janeiro", description: "getSales" },
      { command: "Registrar entrada de 10 unidades do produto 2", description: "createStockMovement" },
      { command: "Registrar saída de 5 unidades do produto 3", description: "createStockMovement" },
      { command: "Adicionar 20 unidades do produto 1 ao estoque", description: "createStockMovement" }
    ];
    
    return Promise.resolve(examples);
  }
  
  /**
   * Check if the AI agent service is available
   */
  async checkHealth(): Promise<boolean> {
    try {
      // Try connecting to the agent API
      const response = await axios.get(`${API_URL}/`);
      return response.status === 200;
    } catch (error) {
      // If that fails, try the query endpoint
      try {
        const queryResponse = await axios.post(`${API_URL}/api/query`, { 
          query: "Olá, você está funcionando?" 
        });
        return true;
      } catch (innerError) {
        console.error('AI agent service is not available:', innerError);
        return false;
      }
    }
  }
}

export default new AIAgentService(); 