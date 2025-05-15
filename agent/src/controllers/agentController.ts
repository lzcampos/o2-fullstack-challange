import { Request, Response } from 'express';
import * as agentService from '../services/agentService';
import { AgentQuery } from '../types';

/**
 * Process a natural language query
 */
export async function processQuery(req: Request, res: Response) {
  try {
    const query: AgentQuery = req.body;

    // Validate request
    if (!query.query || typeof query.query !== 'string') {
      return res.status(400).json({
        error: 'Consulta inválida. Por favor, forneça uma consulta válida no campo "query".',
      });
    }
    
    // Process the query
    const result = await agentService.processQuery(query);
    
    return res.json(result);
  } catch (error) {
    console.error('Error in agent controller:', error);
    return res.status(500).json({
      error: 'Ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.',
    });
  }
}

/**
 * Health check endpoint
 */
export function healthCheck(_req: Request, res: Response) {
  res.json({ status: 'ok', message: 'Agent is running' });
} 