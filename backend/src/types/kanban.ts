export interface Column {
  id: number;
  title: string;
  position: number;
  is_system?: boolean; // Adicionado
  wip_limit?: number;
  cards: Card[];
}

export interface Card {
  id: number;
  title: string;
  description?: string;
  column_id: number;
  position: number;
  due_date?: string;
  assignee_id?: string | null; // Changed to string for UUID
  priority?: 'low' | 'normal' | 'high' | 'critical';
  service_order_id?: number | null;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface MoveCardArgs {
  cardId: number;
  newColumnId: number;
  newPosition: number;
}

export interface CreateCardArgs {
  columnId: number;
  title: string;
  description?: string;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  serviceOrderId?: number | null;
  tags?: string[];
  assigneeId?: string | null;
}

export interface UpdateCardArgs {
  cardId: number;
  title?: string;
  description?: string;
  due_date?: string; // ISO string
  assignee_id?: string | null;
  priority?: 'low' | 'normal' | 'high' | 'critical';
  service_order_id?: number | null;
  tags?: string[];
}

export interface MoveColumnArgs {
  columnId: number;
  newPosition: number;
}