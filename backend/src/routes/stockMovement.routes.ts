import { Router } from 'express';
import * as stockMovementController from '../controllers/stockMovement.controller';
import { validate } from '../middlewares/validator';
import { 
  createStockMovementSchema,
  getStockMovementsSchema
} from '../middlewares/schemas';

const router = Router();

// GET /api/stock-movements - Get all stock movements with pagination and filters
router.get('/', validate(getStockMovementsSchema), stockMovementController.getAllStockMovements);

// POST /api/stock-movements - Create a new stock movement
router.post('/', validate(createStockMovementSchema), stockMovementController.createStockMovement);

// GET /api/stock-movements/popular - Get popular products based on movements
router.get('/popular', stockMovementController.getPopularProducts);

export default router; 