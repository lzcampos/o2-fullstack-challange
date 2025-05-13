import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { NLPService } from './services/NLPService';
import { StockService } from './services/StockService';

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
app.use(express.json());
app.use(cors());

// Configure services
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api';
const stockService = new StockService(API_BASE_URL);
const nlpService = new NLPService(stockService);

// Define routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'AI Agent is running' });
});

/**
 * AI Agent Endpoint
 * This endpoint accepts natural language commands in Portuguese and processes them
 */
app.post('/agent/query', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ 
        error: 'Consulta vazia. Por favor, forneça uma pergunta ou comando.' 
      });
    }

    // Process the natural language query
    const result = await nlpService.processQuery(query);
    
    // Add helpful message to the response
    let responseMessage = '';
    if (result.error) {
      responseMessage = result.error;
    } else {
      responseMessage = 'Comando processado com sucesso.';
    }

    res.status(200).json({
      message: responseMessage,
      data: result,
      query
    });
  } catch (error) {
    console.error('Error processing query:', error);
    res.status(500).json({ 
      error: 'Ocorreu um erro ao processar sua consulta. Por favor, tente novamente mais tarde.' 
    });
  }
});

// Examples endpoint for help
app.get('/agent/examples', (req, res) => {
  const examples = [
    {
      command: 'Mostrar vendas totais do mês atual',
      description: 'Retorna as vendas totais do mês corrente'
    },
    {
      command: 'Obter vendas totais do produto 5',
      description: 'Retorna as vendas totais para um produto específico'
    },
    {
      command: 'Mostrar vendas da categoria Eletrônicos',
      description: 'Retorna as vendas filtradas por categoria'
    },
    {
      command: 'Ver produtos mais populares',
      description: 'Lista os produtos mais vendidos'
    },
    {
      command: 'Mostrar estoque atual',
      description: 'Retorna informações sobre o estoque atual'
    },
    {
      command: 'Mostrar resumo de métricas',
      description: 'Retorna um resumo das principais métricas do estoque'
    },
    {
      command: 'Registrar entrada de 10 unidades do produto 2',
      description: 'Registra uma entrada de estoque'
    },
    {
      command: 'Registrar saída de 5 unidades do produto 3',
      description: 'Registra uma saída de estoque'
    }
  ];

  res.status(200).json({ examples });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`AI Agent server running on port ${PORT}`);
}); 