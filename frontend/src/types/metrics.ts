export interface StockValue {
  product_id: number;
  product_name: string;
  quantity: number;
  price: number;
  total_value: number;
}

export interface MovementSummary {
  total_in: number;
  total_out: number;
  total_in_value: number;
  total_out_value: number;
}

export interface StockSummary {
  total_products: number;
  total_stock_value: number;
  total_items_in_stock: number;
  movement_summary?: MovementSummary;
} 