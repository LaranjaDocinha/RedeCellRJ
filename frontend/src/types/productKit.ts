export interface ProductKitItem {
  id?: number; // Optional because it might not exist yet when creating
  product_id: number;
  variation_id: number;
  quantity: number;
  product_name?: string; // For display purposes
  variation_name?: string; // For display purposes
}

export interface ProductKit {
  id: number;
  name: string;
  description?: string;
  price: number;
  total_cost?: number;
  items_count?: number;
  is_active: boolean;
  items: ProductKitItem[];
  created_at?: string;
  updated_at?: string;
}

export interface CreateProductKitDTO {
  name: string;
  description?: string;
  price: number;
  is_active?: boolean;
  items: {
    product_id: number;
    variation_id: number;
    quantity: number;
  }[];
}

export interface UpdateProductKitDTO extends Partial<CreateProductKitDTO> {}
