// frontend/src/types/part.ts
export interface Part {
  id: number;
  name: string;
  description: string;
  sku: string;
  barcode?: string;
  price: number; // Adicionada a propriedade price
  stock_quantity: number;
  imageUrl?: string; // Adicionada a propriedade imageUrl
  is_weighted?: boolean; // New property for weighted products
  is_serialized?: boolean; // New property for serialized products
  created_at: string;
  updated_at: string;
  suppliers: {
    id: number;
    name: string;
    cost: number;
    supplier_count: number;
  }[];
}
