import { z } from 'zod';

// Product schemas
export const createProductSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Product name is required'),
    description: z.string().optional().nullable(),
    price: z.number().int().positive('Price must be a positive integer in cents'),
    category: z.string().optional().nullable()
  })
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().refine(val => !isNaN(Number(val)), {
      message: 'ID must be a number'
    })
  }),
  body: z.object({
    name: z.string().min(1, 'Product name is required').optional(),
    description: z.string().optional().nullable(),
    price: z.number().int().positive('Price must be a positive integer in cents').optional(),
    category: z.string().optional().nullable()
  })
});

export const getProductSchema = z.object({
  params: z.object({
    id: z.string().refine(val => !isNaN(Number(val)), {
      message: 'ID must be a number'
    })
  })
});

export const deleteProductSchema = z.object({
  params: z.object({
    id: z.string().refine(val => !isNaN(Number(val)), {
      message: 'ID must be a number'
    })
  })
});

// Stock movement schemas
export const createStockMovementSchema = z.object({
  body: z.object({
    product_id: z.number().int().positive('Product ID must be a positive integer'),
    quantity: z.number().int().positive('Quantity must be a positive integer'),
    movement_type: z.enum(['in', 'out'], {
      errorMap: () => ({ message: 'Movement type must be either "in" or "out"' })
    }),
    notes: z.string().optional().nullable()
  })
});

export const getStockMovementsSchema = z.object({
  query: z.object({
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    movement_type: z.enum(['in', 'out']).optional(),
    start: z.string().optional().transform(val => val ? parseInt(val) : undefined),
    take: z.string().optional().transform(val => val ? parseInt(val) : undefined)
  })
});

// Metric schemas
export const getMetricsSchema = z.object({
  query: z.object({
    start_date: z.string().optional(),
    end_date: z.string().optional()
  })
}); 