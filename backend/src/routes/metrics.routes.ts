import { Router } from 'express';
import * as metricsController from '../controllers/metrics.controller';
import { validate } from '../middlewares/validator';
import { getMetricsSchema } from '../middlewares/schemas';

const router = Router();

// GET /api/metrics/current-stock - Get current stock values
router.get('/current-stock', metricsController.getCurrentStock);

// GET /api/metrics/stock-movements - Get stock movement summary
router.get('/stock-movements', validate(getMetricsSchema), metricsController.getStockMovementsSummary);

// GET /api/metrics/summary - Get overall stock summary
router.get('/summary', validate(getMetricsSchema), metricsController.getStockSummary);

export default router; 