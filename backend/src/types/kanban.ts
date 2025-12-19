export interface Column {
  id: number;
  title: string;
  position: number;
  cards: Card[];
}

export interface Card {
  id: number;
  title: string;
  description?: string;
  column_id: number;
  position: number;
  due_date?: string;
  assignee_id?: number;
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
}
