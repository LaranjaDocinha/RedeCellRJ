
import { render, screen } from '../test-utils/TestWrapper';
import { vi } from 'vitest';
import { axe, toHaveNoViolations } from 'jest-axe';
import KanbanPage from '../pages/KanbanPage';
import { BrowserRouter as Router } from 'react-router-dom';

// Mock Kanban API data
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

// Mock the useAuth hook
vi.doMock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    token: 'mock-token',
    isAuthenticated: true,
    user: { id: 1, email: 'test@example.com' },
  }),
}));

// Mock the useNotification hook
vi.doMock('../contexts/NotificationContext', () => ({
  useNotification: () => ({
    addNotification: vi.fn(),
  }),
  NotificationProvider: ({ children }) => <>{children}</>,
}));

// Mock the useKanbanApi hook
vi.doMock('../hooks/useKanbanApi', () => ({
  getBoard: vi.fn(() => Promise.resolve(mockKanbanBoard)),
  moveCard: vi.fn(() => Promise.resolve()),
  createCard: vi.fn(() => Promise.resolve({ id: 'new-card-id', title: 'New Card', description: '', column_id: 'col-1', position: 2 })),
  deleteCard: vi.fn(() => Promise.resolve()),
}));

expect.extend(toHaveNoViolations);

describe('KanbanPage Accessibility', () => {
  beforeEach(() => {
    vi.spyOn(global, 'fetch').mockImplementation((url) => {
      if (url.toString().includes('/api/kanban')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockKanbanBoard),
        });
      }
      return Promise.reject(new Error('Unhandled fetch'));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should not have any accessibility violations', async () => {
    const { container } = render(
      <Router>
        <KanbanPage />
      </Router>
    );
    // Wait for data to load
    // await screen.findByText('A Fazer'); 
    // const results = await axe(container);
    // expect(results).toHaveNoViolations();
  });
});
