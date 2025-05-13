import api from './api';
import { StockMovement, StockMovementFilters, NewStockMovement, PopularProduct } from '../types/stockMovement';

export const getStockMovements = async (filters: StockMovementFilters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.start_date) params.append('start_date', filters.start_date);
  if (filters.end_date) params.append('end_date', filters.end_date);
  if (filters.movement_type) params.append('movement_type', filters.movement_type);
  if (filters.start !== undefined) params.append('start', filters.start.toString());
  if (filters.take !== undefined) params.append('take', filters.take.toString());
  
  const response = await api.get('/stock-movements', { params });
  return response.data;
};

export const createStockMovement = async (stockMovement: NewStockMovement): Promise<StockMovement> => {
  const response = await api.post('/stock-movements', stockMovement);
  return response.data;
};

export const getPopularProducts = async (start: number = 0, take: number = 10): Promise<{ data: PopularProduct[], meta: any }> => {
  const response = await api.get(`/stock-movements/popular`, {
    params: { start, take }
  });
  return response.data;
}; 