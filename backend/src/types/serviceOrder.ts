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
  customer_id: string;
  user_id: string;
  product_description: string;
  imei: string | null;
  entry_checklist: Record<string, any>; // JSONB
  issue_description: string;
  technical_report: string | null;
  budget_value: number | null;
  status: ServiceOrderStatus;
  created_at: string;
  updated_at: string;
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
  changed_by_user_id: string;
  created_at: string;
}
