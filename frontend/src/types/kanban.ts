export interface Card {
  id: number;
  column_id: number;
  title: string;
  description?: string;
  position: number;
  priority: 'low' | 'normal' | 'high' | 'critical';
  due_date?: string;
  assignee_id?: string | null;
  service_order_id?: number | null;
  tags?: string[];
  created_at: string;
  updated_at: string;
  
  // Novas propriedades para as 50 melhorias
  cost_price?: number;
  estimated_price?: number;
  battery_health?: number;
  is_warranty?: boolean;
  has_down_payment?: boolean;
  is_vip_customer?: boolean;
  technical_notes?: string;
  complexity?: 'easy' | 'medium' | 'hard';
  checklist?: { task: string; completed: boolean }[];
  timer_started_at?: string | null;
  total_repair_time?: number; // em segundos
}

export interface Column {
  id: number;
  title: string;
  position: number;
  wip_limit: number;
  is_system: boolean;
  cards: Card[];
  color?: string;
}

export interface MoveCardArgs {
  cardId: number | string;
  newColumnId: number | string;
  newPosition: number;
  assignee_id?: string;
}

export interface CreateCardArgs {
  columnId: number;
  title: string;
  description?: string;
  priority?: string;
  serviceOrderId?: number | null;
  tags?: string[];
  assigneeId?: string | null;
}
