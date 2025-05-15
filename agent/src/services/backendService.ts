import axios from 'axios';
import { config } from '../config';
import { SalesQuery, StockMovement, StockMovementInput } from '../types';

const api = axios.create({
  baseURL: config.backendApiUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get sales data based on query parameters
 */
export async function getSales(query: SalesQuery) {
  try {
    const { start_date, end_date, product_id } = query;
    let url = '/api/metrics/stock-movements';
    
    // Add query parameters if provided
    const params: Record<string, string> = {};
    if (start_date) params.start_date = start_date;
    if (end_date) params.end_date = end_date;
    if (product_id) params.product_id = product_id.toString();
    
    const response = await api.get(url, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching sales data:', error);
    throw new Error('Failed to fetch sales data');
  }
}

/**
 * Create a new stock movement
 */
export async function createStockMovement(movement: StockMovementInput) {
  try {
    const response = await api.post('/api/stock-movements', movement);
    return response.data;
  } catch (error) {
    console.error('Error creating stock movement:', error);
    throw new Error('Failed to create stock movement');
  }
}

/**
 * Get a product by ID
 */
export async function getProductById(id: number) {
  try {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching product with ID ${id}:`, error);
    throw new Error(`Failed to fetch product with ID ${id}`);
  }
}

/**
 * Get summary metrics 
 */
export async function getSummaryMetrics(start_date?: string, end_date?: string) {
  try {
    const params: Record<string, string> = {};
    if (start_date) params.start_date = start_date;
    if (end_date) params.end_date = end_date;
    
    const response = await api.get('/api/metrics/summary', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching summary metrics:', error);
    throw new Error('Failed to fetch summary metrics');
  }
}

/**
 * Get popular products
 */
export async function getPopularProducts(limit: number = 5) {
  try {
    const response = await api.get(`/api/stock-movements/popular?start=0&take=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching popular products:', error);
    throw new Error('Failed to fetch popular products');
  }
} 