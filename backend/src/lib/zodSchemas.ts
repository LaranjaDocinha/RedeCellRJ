import { z } from 'zod';

export const partSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  sku: z.string().optional(),
  description: z.string().optional(),
  stock_quantity: z.number().int().min(0, 'Stock cannot be negative'),
  cost_price: z.number().min(0, 'Cost price cannot be negative').optional(),
  supplier_id: z.number().int().optional(),
});

export const serviceOrderSchema = z.object({
  customer_id: z.number().int(),
  product_description: z.string().min(3),
  imei: z.string().length(15).optional(),
  issue_description: z.string().min(10),
  entry_checklist: z.record(z.any()).optional(),
});
