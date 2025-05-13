import { Request, Response } from 'express';
import * as productModel from '../models/product.model';
import { ProductFilters } from '../types';

/**
 * Converts a price in dollars to cents
 * @param priceInDollars The price in dollars as a string or number
 * @returns The price in cents as an integer
 */
const convertToCents = (priceInDollars: string | number): number => {
  // Handle edge cases
  if (priceInDollars === null || priceInDollars === undefined) {
    return 0;
  }
  
  try {
    // If it's already an integer and large (likely already in cents), return as is
    if (typeof priceInDollars === 'number' && Number.isInteger(priceInDollars) && priceInDollars > 100) {
      return priceInDollars;
    }
    
    const price = typeof priceInDollars === 'string' ? parseFloat(priceInDollars) : priceInDollars;
    
    if (isNaN(price)) {
      return 0;
    }
    
    return Math.round(price * 100);
  } catch (error) {
    console.error('Error converting price to cents:', error);
    return 0;
  }
};

export async function getAllProducts(req: Request, res: Response): Promise<void> {
  try {
    const filters: ProductFilters = {
      search: req.query.search as string,
      category: req.query.category as string,
      min_price: req.query.min_price ? convertToCents(req.query.min_price as string) : undefined,
      max_price: req.query.max_price ? convertToCents(req.query.max_price as string) : undefined,
      in_stock: req.query.in_stock === 'true',
      start: req.query.start ? Number(req.query.start) : 0,
      take: req.query.take ? Number(req.query.take) : 100
    };

    const [products, total] = await Promise.all([
      productModel.getProductsWithStock(filters),
      productModel.countProducts(filters)
    ]);

    res.status(200).json({
      data: products,
      meta: {
        total,
        start: filters.start || 0,
        take: filters.take || 100
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching products', error: (error as Error).message });
  }
}

export async function getProductById(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid ID format' });
      return;
    }

    const product = await productModel.getProductWithStockById(id);
    
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching product', error: (error as Error).message });
  }
}

export async function createProduct(req: Request, res: Response): Promise<void> {
  try {
    const { name, description, price, category } = req.body;

    if (!name || price === undefined) {
      res.status(400).json({ message: 'Name and price are required' });
      return;
    }

    const newProduct = await productModel.createProduct({
      name,
      description,
      price: convertToCents(price),
      category
    });

    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: (error as Error).message });
  }
}

export async function updateProduct(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid ID format' });
      return;
    }

    const { name, description, price, category } = req.body;
    
    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = convertToCents(price);
    if (category !== undefined) updateData.category = category;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ message: 'No valid fields to update' });
      return;
    }

    const updatedProduct = await productModel.updateProduct(id, updateData);
    
    if (!updatedProduct) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error updating product', error: (error as Error).message });
  }
}

export async function deleteProduct(req: Request, res: Response): Promise<void> {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ message: 'Invalid ID format' });
      return;
    }

    const deleted = await productModel.deleteProduct(id);
    
    if (!deleted) {
      res.status(404).json({ message: 'Product not found or already deleted' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting product', error: (error as Error).message });
  }
}

export async function getCategories(req: Request, res: Response): Promise<void> {
  try {
    const categories = await productModel.getAllCategories();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories', error: (error as Error).message });
  }
} 