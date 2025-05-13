import axios from 'axios';

const API_URL = process.env.REACT_APP_AGENT_API_URL || 'http://localhost:3002';

export interface QueryResult {
  message: string;
  data: any;
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
      const response = await axios.post(`${API_URL}/agent/query`, { query });
      return response.data;
    } catch (error) {
      console.error('Error sending query to AI agent:', error);
      throw error;
    }
  }

  /**
   * Get example commands that can be used with the AI agent
   */
  async getExamples(): Promise<AgentExample[]> {
    try {
      const response = await axios.get(`${API_URL}/agent/examples`);
      return response.data.examples;
    } catch (error) {
      console.error('Error fetching AI agent examples:', error);
      throw error;
    }
  }
  
  /**
   * Check if the AI agent service is available
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_URL}/health`);
      return response.data.status === 'ok';
    } catch (error) {
      console.error('AI agent service is not available:', error);
      return false;
    }
  }
}

export default new AIAgentService(); 