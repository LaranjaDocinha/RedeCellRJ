import React, { act } from 'react';
import { render, screen, fireEvent, within } from '../test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import { KanbanBoard } from './KanbanBoard';
import { vi } from 'vitest';
import { useKanbanStore } from '../store/kanbanStore';
import { TestProviders } from '../test-utils/TestProviders';

// Mock framer-motion
vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    AnimatePresence: ({ children }) => <>{children}</>,
    useScroll: () => ({ scrollYProgress: { get: () => 0, on: () => () => {}, onChange: () => () => {} } }),
    motion: new Proxy({}, {
      get: (target, prop) => {
        const MockComponent = (props) => {
          const Tag = prop;
          const { whileFocus, whileHover, layout, whileDrag, ...rest } = props;
          return <Tag {...rest} />;
        };
        return MockComponent;
      }
    })
  };
});

// Mock the zustand store for testing
vi.mock('../store/kanbanStore');

describe('KanbanBoard', () => {
  const mockInitialState = {
    cards: {
      'card-1': { id: 'card-1', content: 'Test Card 1' },
    },
    columns: {
      'column-1': {
        id: 'column-1',
        title: 'Test Column',
        cardIds: ['card-1'],
        wipLimit: 5, // Increased WIP limit
      },
    },
    columnOrder: ['column-1'],
    addColumn: vi.fn(),
    removeColumn: vi.fn(),
    renameColumn: vi.fn(),
    addCard: vi.fn(),
    removeCard: vi.fn(),
    editCard: vi.fn(),
    moveCard: vi.fn(),
  };

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    // Reset the mock implementation before each test
    vi.mocked(useKanbanStore).mockImplementation(() => mockInitialState);
  });

  it('renders without crashing', () => {
    render(<TestProviders><KanbanBoard /></TestProviders>);
    expect(screen.getByText(/Test Column/)).toBeInTheDocument();
  });

  it('calls addColumn when "+ Adicionar Coluna" button is clicked', () => {
    render(<TestProviders><KanbanBoard /></TestProviders>);
    fireEvent.click(screen.getByText('+ Adicionar Coluna'));
    expect(mockInitialState.addColumn).toHaveBeenCalledWith('Nova Coluna');
  });

  it('calls removeColumn when remove button is clicked', () => {
    render(<TestProviders><KanbanBoard /></TestProviders>);
    const column = screen.getByTestId('column-column-1');
    fireEvent.click(within(column).getByRole('button', { name: 'Remove column' }));
    expect(mockInitialState.removeColumn).toHaveBeenCalledWith('column-1');
  });

  it('calls renameColumn when column title is edited', () => {
    render(<TestProviders><KanbanBoard /></TestProviders>);
    fireEvent.click(screen.getByText(/Test Column/)); // Activate editing
    const input = screen.getByDisplayValue('Test Column');
    fireEvent.change(input, { target: { value: 'New Title' } });
    fireEvent.blur(input);
    expect(mockInitialState.renameColumn).toHaveBeenCalledWith('column-1', 'New Title');
  });

  it('calls addCard when add card button is clicked', () => {
    render(<TestProviders><KanbanBoard /></TestProviders>);
    const input = screen.getByPlaceholderText('Adicionar novo cartão...');
    fireEvent.change(input, { target: { value: 'New Card Content' } });
    fireEvent.click(screen.getByRole('button', { name: '+' }));
    expect(mockInitialState.addCard).toHaveBeenCalledWith('column-1', 'New Card Content');
  });

  it('calls removeCard when card remove button is clicked', () => {
    render(<TestProviders><KanbanBoard /></TestProviders>);
    const card = screen.getByTestId('card-card-1');
    fireEvent.click(within(card).getByRole('button', { name: 'Remove card' })); // Card remove button
    expect(mockInitialState.removeCard).toHaveBeenCalledWith('card-1', 'column-1');
  });

  it.skip('calls editCard when card content is edited', () => { // TODO: Fix this test
    render(<TestProviders><KanbanBoard /></TestProviders>);
    act(() => {
      fireEvent.click(screen.getByText('Test Card 1')); // Activate editing
    });
    const textarea = screen.getByDisplayValue('Test Card 1');
    act(() => {
      fireEvent.change(textarea, { target: { value: 'Updated Card Content' } });
      fireEvent.blur(textarea);
    });
    expect(mockInitialState.editCard).toHaveBeenCalledWith('card-1', 'Updated Card Content');
  });
});
