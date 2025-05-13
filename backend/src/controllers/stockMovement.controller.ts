import { Request, Response } from 'express';
import * as stockMovementModel from '../models/stockMovement.model';
import * as productModel from '../models/product.model';
import { StockMovementFilters } from '../types';

export async function getAllStockMovements(req: Request, res: Response): Promise<void> {
  try {
    const filters: StockMovementFilters = {
      start_date: req.query.start_date as string,
      end_date: req.query.end_date as string,
      movement_type: req.query.movement_type as 'in' | 'out' | undefined,
      start: req.query.start ? Number(req.query.start) : 0,
      take: req.query.take ? Number(req.query.take) : 100
    };

    const [movements, total] = await Promise.all([
      stockMovementModel.getAllStockMovements(filters),
      stockMovementModel.countStockMovements(filters)
    ]);

    res.status(200).json({
      data: movements,
      meta: {
        total,
        start: filters.start || 0,
        take: filters.take || 100
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stock movements', error: (error as Error).message });
  }
}

export async function createStockMovement(req: Request, res: Response): Promise<void> {
  try {
    const { product_id, quantity, movement_type, notes } = req.body;

    if (!product_id || !quantity || !movement_type) {
      res.status(400).json({ message: 'Product ID, quantity and movement type are required' });
      return;
    }

    if (movement_type !== 'in' && movement_type !== 'out') {
      res.status(400).json({ message: 'Movement type must be either "in" or "out"' });
      return;
    }

    if (quantity <= 0) {
      res.status(400).json({ message: 'Quantity must be greater than zero' });
      return;
    }

    // Check if product exists
    const product = await productModel.getProductById(Number(product_id));
    
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // If movement is 'out', check if there's enough quantity in stock
    if (movement_type === 'out') {
      const productWithStock = await productModel.getProductWithStockById(Number(product_id));
      if (!productWithStock || productWithStock.quantity < quantity) {
        res.status(400).json({ 
          message: 'Not enough stock for this product',
          available: productWithStock?.quantity || 0
        });
        return;
      }
    }

    const newMovement = await stockMovementModel.createStockMovement({
      product_id: Number(product_id),
      quantity: Number(quantity),
      movement_type,
      notes
    });

    res.status(201).json(newMovement);
  } catch (error) {
    if ((error as Error).message.includes('Not enough stock')) {
      res.status(400).json({ message: (error as Error).message });
      return;
    }
    res.status(500).json({ message: 'Error creating stock movement', error: (error as Error).message });
  }
}

export async function getPopularProducts(req: Request, res: Response): Promise<void> {
  try {
    const start = req.query.start ? Number(req.query.start) : 0;
    const take = req.query.take ? Number(req.query.take) : 10;

    const popularProducts = await stockMovementModel.getPopularProducts(start, take);

    res.status(200).json({
      data: popularProducts,
      meta: {
        start,
        take
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching popular products', error: (error as Error).message });
  }
} 