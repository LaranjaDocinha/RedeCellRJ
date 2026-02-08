import { describe, it, expect, beforeEach } from 'vitest';
import { useKanbanStore } from './kanbanStore';

describe('KanbanStore', () => {
  beforeEach(() => {
    // Reset para os dados iniciais do arquivo
    useKanbanStore.setState({
        cards: {
            'card-1': { id: 'card-1', content: 'C1' },
            'card-2': { id: 'card-2', content: 'C2' },
        },
        columns: {
            'col-1': { id: 'col-1', title: 'To Do', cardIds: ['card-1'] },
            'col-2': { id: 'col-2', title: 'Done', cardIds: ['card-2'] },
        },
        columnOrder: ['col-1', 'col-2']
    });
  });

  it('should add a column correctly', () => {
    useKanbanStore.getState().addColumn('Backlog');
    const state = useKanbanStore.getState();
    expect(state.columnOrder).toHaveLength(3);
    expect(state.columnOrder[2]).toBeDefined();
  });

  it('should add a card to a specific column', () => {
    useKanbanStore.getState().addCard('col-1', 'New Task');
    const state = useKanbanStore.getState();
    expect(state.columns['col-1'].cardIds).toHaveLength(2);
    expect(Object.keys(state.cards)).toHaveLength(3);
  });

  it('should move card within the same column', () => {
    useKanbanStore.getState().addCard('col-1', 'Task 2');
    // col-1 agora tem ['card-1', 'new-uuid']
    const stateBefore = useKanbanStore.getState();
    const newCardId = stateBefore.columns['col-1'].cardIds[1];

    useKanbanStore.getState().moveCard(
        { droppableId: 'col-1', index: 1 },
        { droppableId: 'col-1', index: 0 },
        newCardId
    );

    const stateAfter = useKanbanStore.getState();
    expect(stateAfter.columns['col-1'].cardIds[0]).toBe(newCardId);
  });

  it('should move card between different columns', () => {
    useKanbanStore.getState().moveCard(
        { droppableId: 'col-1', index: 0 },
        { droppableId: 'col-2', index: 1 },
        'card-1'
    );

    const state = useKanbanStore.getState();
    expect(state.columns['col-1'].cardIds).toHaveLength(0);
    expect(state.columns['col-2'].cardIds).toHaveLength(2);
    expect(state.columns['col-2'].cardIds[1]).toBe('card-1');
  });
});
