export interface CartItemType {
  id: number;
  product_name?: string;
  name?: string;
  color: string;
  price: number;
  quantity: number;
  subtotal: number;
  image_url?: string;
  salesperson_name?: string;
  notes?: string;
  category_name?: string;
}
