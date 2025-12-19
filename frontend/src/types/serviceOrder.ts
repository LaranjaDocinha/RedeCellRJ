export type ServiceOrderStatus = 
  | 'Aguardando Avaliação'
  | 'Aguardando Aprovação'
  | 'Aprovado'
  | 'Em Reparo'
  | 'Aguardando Peça'
  | 'Aguardando QA'
  | 'Finalizado'
  | 'Não Aprovado'
  | 'Entregue';

export interface ServiceOrder {
  id: number;
  customer_id: number;
  user_id: number;
  product_description: string;
  imei: string | null;
  entry_checklist: Record<string, any>; // JSONB
  issue_description: string;
  technical_report: string | null;
  budget_value: number | null;
  status: ServiceOrderStatus;
  created_at: string;
  updated_at: string;
  // Adicionando campos que podem vir do join no backend
  customer_name?: string;
  technician_name?: string;
}

export interface ServiceOrderItem {
  id: number;
  service_order_id: number;
  part_id: number | null;
  service_description: string;
  quantity: number;
  unit_price: number;
  created_at: string;
}

export interface ServiceOrderStatusHistory {
  id: number;
  service_order_id: number;
  old_status: ServiceOrderStatus | null;
  new_status: ServiceOrderStatus;
  changed_by_user_id: number;
  created_at: string;
}
