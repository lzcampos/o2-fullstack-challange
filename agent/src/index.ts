import express from 'express';
import cors from 'cors';
import { config } from './config';
import routes from './routes';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Default route
app.get('/', (_req, res) => {
  res.json({
    message: 'Bem-vindo ao Agente de IA de Gerenciamento de Estoque',
    endpoints: {
      query: '/api/query',
      health: '/api/health',
    },
  });
});

// Start the server
app.listen(config.port, () => {
  console.log(`Agent server running on port ${config.port}`);
  console.log(`Ollama API URL: ${config.ollama.apiUrl}`);
  console.log(`Backend API URL: ${config.backendApiUrl}`);
}); 