import db from '../config/database';
import { StockValue, StockSummary } from '../types';
import { getStockMovementSummary } from './stockMovement.model';

export async function getCurrentStockValue(): Promise<StockValue[]> {
  return db('products as p')
    .select(
      'p.id as product_id',
      'p.name as product_name',
      'p.price',
      db.raw('COALESCE(s.quantity, 0) as quantity'),
      db.raw('COALESCE(s.quantity, 0) * p.price as total_value')
    )
    .leftJoin('stock as s', 'p.id', 's.product_id')
    .where(function() {
      this.where('s.quantity', '>', 0).orWhereNull('s.quantity');
    })
    .orderBy('p.name');
}

export async function getStockSummary(
  startDate?: string,
  endDate?: string
): Promise<StockSummary> {
  // Get total products count
  const productCount = await db('products').count('id as count').first();
  
  // Get total stock value and items
  const stockSummary = await db('stock as s')
    .join('products as p', 's.product_id', 'p.id')
    .select(
      db.raw('SUM(s.quantity) as total_items'),
      db.raw('SUM(s.quantity * p.price) as total_value')
    )
    .first();
  
  // Get movement summary if dates provided
  let movementSummary;
  if (startDate || endDate) {
    movementSummary = await getStockMovementSummary(startDate, endDate);
  }
  
  return {
    total_products: Number(productCount?.count || 0),
    total_stock_value: Number(stockSummary?.total_value || 0),
    total_items_in_stock: Number(stockSummary?.total_items || 0),
    ...(movementSummary && { movement_summary: movementSummary })
  };
} 