import api from './api';
import { StockValue, StockSummary, MovementSummary } from '../types/metrics';

export const getCurrentStockValue = async (): Promise<{ data: StockValue[], summary: any }> => {
  const response = await api.get('/metrics/current-stock');
  return response.data;
};

export const getStockMovementsSummary = async (startDate?: string, endDate?: string): Promise<{ data: MovementSummary, meta: any }> => {
  const params = new URLSearchParams();
  
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  
  const response = await api.get('/metrics/stock-movements', { params });
  return response.data;
};

export const getStockSummary = async (startDate?: string, endDate?: string): Promise<StockSummary> => {
  const params = new URLSearchParams();
  
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);
  
  const response = await api.get('/metrics/summary', { params });
  return response.data;
}; 