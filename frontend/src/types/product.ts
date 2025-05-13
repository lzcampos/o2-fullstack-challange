export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductWithStock extends Product {
  quantity: number;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  in_stock?: boolean;
  start?: number;
  take?: number;
}

export interface ProductsResponse {
  data: ProductWithStock[];
  meta: {
    total: number;
    start: number;
    take: number;
  };
} 