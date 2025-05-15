// Query related types
export interface AgentQuery {
  query: string;
}

export interface AgentResponse {
  response: string;
  action?: string;
  data?: unknown;
}

// Backend API types
export interface StockMovementInput {
  product_id: number;
  quantity: number;
  movement_type: 'in' | 'out';
  notes?: string;
}

export interface StockMovement extends StockMovementInput {
  id: number;
  created_at: string;
}

export interface SalesQuery {
  start_date?: string;
  end_date?: string;
  product_id?: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
}

// Ollama API types
export interface OllamaRequest {
  model: string;
  prompt: string;
  options?: {
    temperature?: number;
    top_p?: number;
    top_k?: number;
    num_predict?: number;
    stop?: string[];
  };
  stream?: boolean;
}

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
}

// Action types
export type ActionType = 'getSales' | 'createStockMovement';

export interface ActionConfig {
  type: ActionType;
  params: Record<string, any>;
}

export interface ParsedQuery {
  intent: ActionType | null;
  params: Record<string, any>;
  rawQuery: string;
  error?: string;
}

export interface Sale {
  id: number;
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  total: number;
  date: string;
}

export interface ProductInfo {
  id: number;
  name: string;
  price: number;
  current_stock: number;
} 