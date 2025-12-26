// frontend/src/types/product.ts

export interface ProductVariation {
  id?: number;
  product_id?: number;
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
  supplier_id: number;
  supplier_name?: string;
  cost: number;
  lead_time_days?: number | null;
  supplier_part_number?: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string | null;
  branch_id: number;
  category_id?: number | null;
  description?: string;
  product_type?: string;
  is_serialized?: boolean;
  promotion?: boolean;
  variations: ProductVariation[];
  suppliers?: ProductSupplier[];
  created_at?: string;
  updated_at?: string;
}