// frontend/src/types/product.ts
import { ProductId, BranchId, CategoryId, VariationId } from './branded';

export interface ProductVariation {
  id?: VariationId;
  product_id?: ProductId;
  name?: string;
  sku: string;
  color?: string;
  storage_capacity?: string;
  price: number;
  cost_price?: number;
  stock_quantity: number;
  low_stock_threshold?: number;
  image_url?: string;
}

export interface ProductSupplier {
  supplier_id: number; // TODO: Criar SupplierId
  supplier_name?: string;
  cost: number;
  lead_time_days?: number | null;
  supplier_part_number?: string;
}

export interface Product {
  id: ProductId;
  name: string;
  sku: string | null;
  branch_id: BranchId;
  category_id?: CategoryId | null;
  description?: string;
  product_type?: string;
  is_serialized?: boolean;
  promotion?: boolean;
  variations: ProductVariation[];
  suppliers?: ProductSupplier[];
  created_at?: string;
  updated_at?: string;
}
