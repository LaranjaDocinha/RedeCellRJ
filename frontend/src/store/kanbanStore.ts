import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

interface Card {
  id: string;
  content: string;
}

interface Column {
  id: string;
  title: string;
  cardIds: string[];
  wipLimit?: number;
}

interface KanbanState {
  cards: Record<string, Card>;
  columns: Record<string, Column>;
  columnOrder: string[];
  addColumn: (title: string) => void;
  removeColumn: (columnId: string) => void;
  renameColumn: (columnId: string, newTitle: string) => void;
  addCard: (columnId: string, content: string) => void;
  removeCard: (cardId: string, columnId: string) => void;
  editCard: (cardId: string, newContent: string) => void;
  moveCard: (
    source: { droppableId: string; index: number },
    destination: { droppableId: string; index: number },
    draggableId: string,
  ) => void;
}

const initialData = {
  cards: {
    'card-1': { id: 'card-1', content: 'Configurar ambiente de desenvolvimento' },
    'card-2': { id: 'card-2', content: 'Pesquisar bibliotecas de UI' },
    'card-3': { id: 'card-3', content: 'Definir paleta de cores' },
    'card-4': { id: 'card-4', content: 'Criar componente de botão' },
  },
  columns: {
    'column-1': {
      id: 'column-1',
      title: 'A Fazer',
      cardIds: ['card-1', 'card-2'],
      wipLimit: 3,
    },
    'column-2': {
      id: 'column-2',
      title: 'Em Andamento',
      cardIds: ['card-3'],
      wipLimit: 2,
    },
    'column-3': {
      id: 'column-3',
      title: 'Concluído',
      cardIds: ['card-4'],
    },
  },
  columnOrder: ['column-1', 'column-2', 'column-3'],
};

export const useKanbanStore = create<KanbanState>((set) => ({
  ...initialData,

  addColumn: (title) =>
    set((state) => {
      const newColumnId = uuidv4();
      const newColumn: Column = {
        id: newColumnId,
        title: title,
        cardIds: [],
      };
      return {
        columns: {
          ...state.columns,
          [newColumnId]: newColumn,
        },
        columnOrder: [...state.columnOrder, newColumnId],
      };
    }),

  removeColumn: (columnId) =>
    set((state) => {
      const newColumns = { ...state.columns };
      delete newColumns[columnId];
      const newColumnOrder = state.columnOrder.filter((id) => id !== columnId);
      const newCards = { ...state.cards };
      state.columns[columnId].cardIds.forEach((cardId) => delete newCards[cardId]);

      return {
        columns: newColumns,
        columnOrder: newColumnOrder,
        cards: newCards,
      };
    }),

  renameColumn: (columnId, newTitle) =>
    set((state) => ({
      columns: {
        ...state.columns,
        [columnId]: {
          ...state.columns[columnId],
          title: newTitle,
        },
      },
    })),

  addCard: (columnId, content) =>
    set((state) => {
      const newCardId = uuidv4();
      const newCard: Card = {
        id: newCardId,
        content: content,
      };
      return {
        cards: {
          ...state.cards,
          [newCardId]: newCard,
        },
        columns: {
          ...state.columns,
          [columnId]: {
            ...state.columns[columnId],
            cardIds: [...state.columns[columnId].cardIds, newCardId],
          },
        },
      };
    }),

  removeCard: (cardId, columnId) =>
    set((state) => {
      const newCards = { ...state.cards };
      delete newCards[cardId];

      const newColumn = {
        ...state.columns[columnId],
        cardIds: state.columns[columnId].cardIds.filter((id) => id !== cardId),
      };

      return {
        cards: newCards,
        columns: {
          ...state.columns,
          [columnId]: newColumn,
        },
      };
    }),

  editCard: (cardId, newContent) =>
    set((state) => ({
      cards: {
        ...state.cards,
        [cardId]: {
          ...state.cards[cardId],
          content: newContent,
        },
      },
    })),

  moveCard: (source, destination, draggableId) =>
    set((state) => {
      const start = state.columns[source.droppableId];
      const finish = state.columns[destination.droppableId];

      if (start === finish) {
        const newCardIds = Array.from(start.cardIds);
        newCardIds.splice(source.index, 1);
        newCardIds.splice(destination.index, 0, draggableId);

        const newColumn = {
          ...start,
          cardIds: newCardIds,
        };

        return {
          columns: {
            ...state.columns,
            [newColumn.id]: newColumn,
          },
        };
      }

      // Moving from one list to another
      const startCardIds = Array.from(start.cardIds);
      startCardIds.splice(source.index, 1);
      const newStart = {
        ...start,
        cardIds: startCardIds,
      };

      const finishCardIds = Array.from(finish.cardIds);
      finishCardIds.splice(destination.index, 0, draggableId);
      const newFinish = {
        ...finish,
        cardIds: finishCardIds,
      };

      return {
        columns: {
          ...state.columns,
          [newStart.id]: newStart,
          [newFinish.id]: newFinish,
        },
      };
    }),
}));
