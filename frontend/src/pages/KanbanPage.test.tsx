import { render, screen } from '../test-utils/test-utils';
import { vi } from 'vitest';
import { axe } from 'jest-axe';
import KanbanPage from '../pages/KanbanPage';
import { TestProviders } from '../test-utils/TestProviders';

// Mock Kanban API data
vi.mock('../hooks/useKanbanApi', () => {
  const mockKanbanBoard = [
    {
      id: 'col-1',
      title: 'A Fazer',
      cards: [
        { id: 'card-1', title: 'Tarefa 1', description: 'Descrição da Tarefa 1', column_id: 'col-1', position: 0 },
        { id: 'card-2', title: 'Tarefa 2', description: 'Descrição da Tarefa 2', column_id: 'col-1', position: 1 },
      ],
    },
    {
      id: 'col-2',
      title: 'Em Andamento',
      cards: [
        { id: 'card-3', title: 'Tarefa 3', description: 'Descrição da Tarefa 3', column_id: 'col-2', position: 0 },
      ],
    },
  ];
  return {
    getBoard: vi.fn().mockResolvedValue(mockKanbanBoard),
    moveCard: vi.fn().mockResolvedValue(undefined),
    createCard: vi.fn().mockResolvedValue({ id: 'new-card-id', title: 'New Card', description: '', column_id: 'col-1', position: 2 }),
    deleteCard: vi.fn().mockResolvedValue(undefined),
  };
});

describe('KanbanPage Accessibility', () => {
  it('should not have any accessibility violations', async () => {
    const { container } = render(<TestProviders><KanbanPage /></TestProviders>); // Wrapped with TestProviders
    // Wait for data to load
    await screen.findByText('A Fazer');
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});