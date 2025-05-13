import api from './api';
import { Product, ProductWithStock, ProductFilters } from '../types/product';

export const getProducts = async (filters: ProductFilters = {}) => {
  const params = new URLSearchParams();
  
  if (filters.search) params.append('search', filters.search);
  if (filters.category) params.append('category', filters.category);
  if (filters.min_price !== undefined) params.append('min_price', filters.min_price.toString());
  if (filters.max_price !== undefined) params.append('max_price', filters.max_price.toString());
  if (filters.in_stock !== undefined) params.append('in_stock', filters.in_stock.toString());
  if (filters.start !== undefined) params.append('start', filters.start.toString());
  if (filters.take !== undefined) params.append('take', filters.take.toString());
  
  const response = await api.get('/products', { params });
  return response.data;
};

export const getProductById = async (id: number): Promise<ProductWithStock> => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> => {
  const response = await api.post('/products', product);
  return response.data;
};

export const updateProduct = async (id: number, product: Partial<Product>): Promise<Product> => {
  const response = await api.put(`/products/${id}`, product);
  return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`/products/${id}`);
};

export const getCategories = async (): Promise<string[]> => {
  const response = await api.get('/products/categories/all');
  return response.data;
}; 