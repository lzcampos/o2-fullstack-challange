import { Request, Response } from 'express';
import * as metricsModel from '../models/metrics.model';
import * as stockMovementModel from '../models/stockMovement.model';

export async function getCurrentStock(req: Request, res: Response): Promise<void> {
  try {
    const stockValues = await metricsModel.getCurrentStockValue();
    
    const totalValue = stockValues.reduce((sum, item) => sum + Number(item.total_value), 0);
    const totalItems = stockValues.reduce((sum, item) => sum + Number(item.quantity), 0);

    res.status(200).json({
      data: stockValues,
      summary: {
        total_value: totalValue,
        total_items: totalItems,
        product_count: stockValues.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching current stock', error: (error as Error).message });
  }
}

export async function getStockMovementsSummary(req: Request, res: Response): Promise<void> {
  try {
    const start_date = req.query.start_date as string;
    const end_date = req.query.end_date as string;
    
    const summary = await stockMovementModel.getStockMovementSummary(start_date, end_date);
    
    res.status(200).json({
      data: summary,
      meta: {
        start_date,
        end_date
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stock movements summary', error: (error as Error).message });
  }
}

export async function getStockSummary(req: Request, res: Response): Promise<void> {
  try {
    const start_date = req.query.start_date as string;
    const end_date = req.query.end_date as string;
    
    const summary = await metricsModel.getStockSummary(start_date, end_date);
    
    res.status(200).json(summary);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stock summary', error: (error as Error).message });
  }
} 