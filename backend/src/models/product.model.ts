import db from '../config/database';
import { Product, NewProduct, ProductFilters, ProductWithStock } from '../types';

export async function getAllProducts(filters: ProductFilters = {}): Promise<Product[]> {
  const query = db('products')
    .select('*')
    .orderBy('name');

  // Apply filters
  if (filters.search) {
    query.where(function() {
      this.where('name', 'ilike', `%${filters.search}%`)
        .orWhere('description', 'ilike', `%${filters.search}%`);
    });
  }

  if (filters.category) {
    query.where('category', filters.category);
  }

  if (filters.min_price !== undefined) {
    query.where('price', '>=', filters.min_price);
  }

  if (filters.max_price !== undefined) {
    query.where('price', '<=', filters.max_price);
  }

  // Apply pagination
  if (filters.take !== undefined) {
    const limit = filters.take;
    const offset = filters.start || 0;
    query.limit(limit).offset(offset);
  }

  return query;
}

export async function getProductsWithStock(filters: ProductFilters = {}): Promise<ProductWithStock[]> {
  const query = db('products as p')
    .select(
      'p.*',
      db.raw('COALESCE(s.quantity, 0) as quantity')
    )
    .leftJoin('stock as s', 'p.id', 's.product_id')
    .orderBy('p.name');

  // Apply filters
  if (filters.search) {
    query.where(function() {
      this.where('p.name', 'ilike', `%${filters.search}%`)
        .orWhere('p.description', 'ilike', `%${filters.search}%`);
    });
  }

  if (filters.category) {
    query.where('p.category', filters.category);
  }

  if (filters.min_price !== undefined) {
    query.where('p.price', '>=', filters.min_price);
  }

  if (filters.max_price !== undefined) {
    query.where('p.price', '<=', filters.max_price);
  }

  if (filters.in_stock) {
    query.where('s.quantity', '>', 0);
  }

  // Apply pagination
  if (filters.take !== undefined) {
    const limit = filters.take;
    const offset = filters.start || 0;
    query.limit(limit).offset(offset);
  }

  return query;
}

export async function countProducts(filters: ProductFilters = {}): Promise<number> {
  const query = db('products')
    .count('id as count')
    .first();

  // Apply filters
  if (filters.search) {
    query.where(function() {
      this.where('name', 'ilike', `%${filters.search}%`)
        .orWhere('description', 'ilike', `%${filters.search}%`);
    });
  }

  if (filters.category) {
    query.where('category', filters.category);
  }

  if (filters.min_price !== undefined) {
    query.where('price', '>=', filters.min_price);
  }

  if (filters.max_price !== undefined) {
    query.where('price', '<=', filters.max_price);
  }

  const result = await query;
  return Number(result?.count || 0);
}

export async function getProductById(id: number): Promise<Product | null> {
  return db('products')
    .where({ id })
    .first();
}

export async function getProductWithStockById(id: number): Promise<ProductWithStock | null> {
  return db('products as p')
    .select(
      'p.*',
      db.raw('COALESCE(s.quantity, 0) as quantity')
    )
    .leftJoin('stock as s', 'p.id', 's.product_id')
    .where('p.id', id)
    .first();
}

export async function createProduct(product: NewProduct): Promise<Product> {
  const [newProduct] = await db('products')
    .insert(product)
    .returning('*');
  
  return newProduct;
}

export async function updateProduct(id: number, product: Partial<NewProduct>): Promise<Product | null> {
  const [updatedProduct] = await db('products')
    .where({ id })
    .update(product)
    .returning('*');
  
  return updatedProduct || null;
}

export async function deleteProduct(id: number): Promise<boolean> {
  const count = await db('products')
    .where({ id })
    .delete();
  
  return count > 0;
}

export async function getAllCategories(): Promise<string[]> {
  const categories = await db('products')
    .distinct('category')
    .whereNotNull('category')
    .orderBy('category');
  
  return categories.map(c => c.category);
} 