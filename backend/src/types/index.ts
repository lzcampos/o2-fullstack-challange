export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface NewProduct {
  name: string;
  description?: string;
  price: number;
  category?: string;
}

export interface Stock {
  id: number;
  product_id: number;
  quantity: number;
  updated_at: Date;
}

export interface StockMovement {
  id: number;
  product_id: number;
  quantity: number;
  movement_type: 'in' | 'out';
  movement_date: Date;
  notes?: string;
}

export interface NewStockMovement {
  product_id: number;
  quantity: number;
  movement_type: 'in' | 'out';
  notes?: string;
}

export interface ProductWithStock extends Product {
  quantity: number;
}

export interface StockValue {
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  total_value: number;
}

export interface PaginationParams {
  start?: number;
  take?: number;
}

export interface StockMovementFilters extends PaginationParams {
  start_date?: string;
  end_date?: string;
  movement_type?: 'in' | 'out';
}

export interface ProductFilters extends PaginationParams {
  search?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
}

export interface PopularProduct {
  product_id: number;
  product_name: string;
  total_movements: number;
  total_in: number;
  total_out: number;
}

export interface StockSummary {
  total_products: number;
  total_stock_value: number;
  total_items_in_stock: number;
  movement_summary?: {
    total_in: number;
    total_out: number;
    total_in_value: number;
    total_out_value: number;
  };
} 