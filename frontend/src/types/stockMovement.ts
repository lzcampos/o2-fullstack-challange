export interface StockMovement {
  id: number;
  product_id: number;
  product_name?: string;
  quantity: number;
  movement_type: 'in' | 'out';
  movement_date: string;
  notes: string | null;
}

export interface NewStockMovement {
  product_id: number;
  quantity: number;
  movement_type: 'in' | 'out';
  notes?: string;
}

export interface StockMovementFilters {
  start_date?: string;
  end_date?: string;
  movement_type?: 'in' | 'out';
  start?: number;
  take?: number;
}

export interface StockMovementsResponse {
  data: StockMovement[];
  meta: {
    total: number;
    start: number;
    take: number;
  };
}

export interface PopularProduct {
  product_id: number;
  product_name: string;
  total_movements: number;
  total_in: number;
  total_out: number;
} 