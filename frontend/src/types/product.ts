// frontend/src/types/product.ts
export interface Product {
  id: number;
  name: string;
  sku: string | null;
  branch_id: number;
  description?: string; // Added description
  promotion?: boolean; // Added promotion flag
  variations: { price: number, image_url?: string }[];
}
