import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { validate } from '../middlewares/validator';
import { 
  createProductSchema,
  updateProductSchema,
  getProductSchema,
  deleteProductSchema
} from '../middlewares/schemas';

const router = Router();

// GET /api/products - Get all products with pagination and filters
router.get('/', productController.getAllProducts);

// GET /api/products/categories - Get all product categories
router.get('/categories/all', productController.getCategories);

// GET /api/products/:id - Get a single product by ID
router.get('/:id', validate(getProductSchema), productController.getProductById);

// POST /api/products - Create a new product
router.post('/', validate(createProductSchema), productController.createProduct);

// PUT /api/products/:id - Update a product
router.put('/:id', validate(updateProductSchema), productController.updateProduct);

// DELETE /api/products/:id - Delete a product
router.delete('/:id', validate(deleteProductSchema), productController.deleteProduct);

export default router; 