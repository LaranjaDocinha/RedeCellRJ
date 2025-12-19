interface SupplierInfo {
  id: number;
  name: string;
  cost: number;
  lead_time_days?: number;
  supplier_part_number?: string;
}

export interface Part {
  id: number;
  name: string;
  sku: string | null;
  description: string | null;
  stock_quantity: number;
  created_at: string;
  updated_at: string;
  suppliers?: SupplierInfo[];
}
