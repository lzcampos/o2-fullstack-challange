import db from '../config/database';
import { StockMovement, NewStockMovement, StockMovementFilters, PopularProduct } from '../types';

export async function getAllStockMovements(filters: StockMovementFilters = {}): Promise<StockMovement[]> {
  const query = db('stock_movements as sm')
    .select('sm.*', 'p.name as product_name')
    .join('products as p', 'sm.product_id', 'p.id')
    .orderBy('sm.movement_date', 'desc');

  // Apply filters
  if (filters.start_date) {
    query.where('sm.movement_date', '>=', filters.start_date);
  }

  if (filters.end_date) {
    query.where('sm.movement_date', '<=', filters.end_date);
  }

  if (filters.movement_type) {
    query.where('sm.movement_type', filters.movement_type);
  }

  // Apply pagination
  if (filters.take !== undefined) {
    const limit = filters.take;
    const offset = filters.start || 0;
    query.limit(limit).offset(offset);
  }

  return query;
}

export async function countStockMovements(filters: StockMovementFilters = {}): Promise<number> {
  const query = db('stock_movements as sm')
    .count('sm.id as count')
    .first();

  // Apply filters
  if (filters.start_date) {
    query.where('sm.movement_date', '>=', filters.start_date);
  }

  if (filters.end_date) {
    query.where('sm.movement_date', '<=', filters.end_date);
  }

  if (filters.movement_type) {
    query.where('sm.movement_type', filters.movement_type);
  }

  const result = await query;
  return Number(result?.count || 0);
}

export async function getStockMovementById(id: number): Promise<StockMovement | null> {
  return db('stock_movements')
    .where({ id })
    .first();
}

export async function createStockMovement(movement: NewStockMovement): Promise<StockMovement> {
  const [newMovement] = await db('stock_movements')
    .insert(movement)
    .returning('*');
  
  return newMovement;
}

export async function getPopularProducts(start = 0, take = 10): Promise<PopularProduct[]> {
  return db('stock_movements as sm')
    .select(
      'sm.product_id',
      'p.name as product_name',
      db.raw('COUNT(sm.id) as total_movements'),
      db.raw('SUM(CASE WHEN sm.movement_type = \'in\' THEN sm.quantity ELSE 0 END) as total_in'),
      db.raw('SUM(CASE WHEN sm.movement_type = \'out\' THEN sm.quantity ELSE 0 END) as total_out')
    )
    .join('products as p', 'sm.product_id', 'p.id')
    .groupBy('sm.product_id', 'p.name')
    .orderBy('total_movements', 'desc')
    .limit(take)
    .offset(start);
}

export async function getStockMovementSummary(
  startDate?: string, 
  endDate?: string
): Promise<{ total_in: number; total_out: number; total_in_value: number; total_out_value: number }> {
  const query = db('stock_movements as sm')
    .select(
      db.raw('SUM(CASE WHEN sm.movement_type = \'in\' THEN sm.quantity ELSE 0 END) as total_in'),
      db.raw('SUM(CASE WHEN sm.movement_type = \'out\' THEN sm.quantity ELSE 0 END) as total_out'),
      db.raw('SUM(CASE WHEN sm.movement_type = \'in\' THEN sm.quantity * p.price ELSE 0 END) as total_in_value'),
      db.raw('SUM(CASE WHEN sm.movement_type = \'out\' THEN sm.quantity * p.price ELSE 0 END) as total_out_value')
    )
    .join('products as p', 'sm.product_id', 'p.id')
    .first();

  if (startDate) {
    query.where('sm.movement_date', '>=', startDate);
  }

  if (endDate) {
    query.where('sm.movement_date', '<=', endDate);
  }

  const result = await query;
  return {
    total_in: Number(result?.total_in || 0),
    total_out: Number(result?.total_out || 0),
    total_in_value: Number(result?.total_in_value || 0),
    total_out_value: Number(result?.total_out_value || 0)
  };
} 