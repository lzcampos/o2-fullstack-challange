import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3003,
  backendApiUrl: process.env.BACKEND_API_URL || 'http://localhost:3000',
  ollama: {
    apiUrl: process.env.OLLAMA_API_URL || 'http://localhost:11434',
    model: process.env.OLLAMA_MODEL || 'qwen3:0.6b',
  },
}; 