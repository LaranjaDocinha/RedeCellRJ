import React from 'react';
import { render, screen, waitFor, waitForElementToBeRemoved, act, fireEvent } from '../test-utils/TestWrapper';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardPage from './DashboardPage';
import { axe } from 'jest-axe';
import * as userDashboardApi from '../hooks/useUserDashboardApi';

const addToastMock = vi.fn();

// Mock the useAuth hook
vi.mock('../contexts/AuthContext', async () => {
  const actual = await vi.importActual('../contexts/AuthContext');
  return {
    ...actual,
    useAuth: () => ({
      token: 'mock-token',
      isAuthenticated: true,
      user: { id: 1, email: 'test@example.com', branch_id: 1 },
    }),
  };
});

// Mock the useNotification hook
vi.mock('../contexts/NotificationContext', async () => {
  const actual = await vi.importActual('../contexts/NotificationContext');
  return {
    ...actual,
    useNotification: () => ({
      addToast: addToastMock,
    }),
  };
});

// Mock the useUserDashboardApi hook
vi.mock('../hooks/useUserDashboardApi', () => ({
  getSettings: vi.fn(() => Promise.resolve({ widgets: [] })),
  updateSettings: vi.fn(() => Promise.resolve()),
}));

// Mock the DndContext and its components
vi.mock('@dnd-kit/core', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    DndContext: ({ children, onDragEnd }: any) => (
      <div 
        data-testid="mock-dnd-context" 
        onClick={() => onDragEnd({
          active: { id: 'totalSales' },
          over: { id: 'recentSales' },
        })}
      >
        {children}
      </div>
    ),
    useSensor: vi.fn(() => ({})),
    useSensors: vi.fn(() => ([{}])),
  };
});

vi.mock('@dnd-kit/sortable', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    SortableContext: ({ children }: any) => (
      <div data-testid="mock-sortable-context">
        {children}
      </div>
    ),
    useSortable: vi.fn(() => ({
      attributes: {},
      listeners: {},
      setNodeRef: vi.fn(),
      transform: null,
      transition: null,
    })),
    arrayMove: vi.fn((items, oldIndex, newIndex) => {
      const newItems = [...items];
      const [removed] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, removed);
      return newItems;
    }),
  };
});


const mockDashboardData = {
  totalSales: 1234.56,
  salesByMonth: [],
  topSellingProducts: [],
  recentSales: [],
};

describe('DashboardPage Accessibility', () => {
  beforeEach(() => {
    // Explicitly mock matchMedia for this test suite
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    global.fetch = vi.fn((url) => new Promise(resolve => setTimeout(() => {
      const urlString = new URL(url.toString(), 'http://localhost').toString();
      if (urlString.includes('/dashboard')) {
        resolve({
          ok: true,
          json: () => Promise.resolve(mockDashboardData),
        } as Response);
      }
      if (urlString.includes('/api/loyalty/points')) {
        resolve({
          ok: true,
          json: () => Promise.resolve({ loyalty_points: 500 }),
        } as Response);
      }
      if (urlString.includes('/api/activity-feed')) {
        resolve({
          ok: true,
          json: () => Promise.resolve([]),
        } as Response);
      }
      if (urlString.includes('/sales')) { // For RecentSalesWidget
        resolve({
          ok: true,
          json: () => Promise.resolve([]), // Empty array for recent sales
        } as Response);
      }
      resolve(new Response(null, { status: 404, statusText: 'Not Found' }));
    }, 10)));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should not have any accessibility violations', async () => {
    let container;
    await act(async () => {
      const { container: c } = render(
        <DashboardPage />
      );
      container = c;
    });

    // Wait for all widgets to load their content
    await screen.findByText('R$ 1234.56');
    await screen.findByText('500');
    await screen.findByText('Nenhuma venda recente encontrada.');

    // Now that the component is stable, run the accessibility check
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

describe('DashboardPage Functionality', () => {

  beforeEach(() => {
    // Explicitly mock matchMedia for this test suite
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(), // deprecated
        removeListener: vi.fn(), // deprecated
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    addToastMock.mockClear();
    vi.mocked(userDashboardApi.updateSettings).mockClear();

    global.fetch = vi.fn((url) => new Promise(resolve => setTimeout(() => {
      const urlString = new URL(url.toString(), 'http://localhost').toString();
      if (urlString.includes('/dashboard')) {
        resolve({
          ok: true,
          json: () => Promise.resolve(mockDashboardData),
        } as Response);
      }
      if (urlString.includes('/api/loyalty/points')) {
        resolve({
          ok: true,
          json: () => Promise.resolve({ loyalty_points: 500 }),
        } as Response);
      }
      if (urlString.includes('/api/activity-feed')) {
        resolve({
          ok: true,
          json: () => Promise.resolve([]),
        } as Response);
      }
      if (urlString.includes('/sales')) { // For RecentSalesWidget
        resolve({
          ok: true,
          json: () => Promise.resolve([]), // Empty array for recent sales
        } as Response);
      }
      resolve(new Response(null, { status: 404, statusText: 'Not Found' }));
    }, 10)));
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should reorder widgets on drag end and save settings', async () => {
    const { getByTestId } = render(<DashboardPage />);

    await screen.findByText('Vendas Totais');

    const dndContext = getByTestId('mock-dnd-context');

    // Simulate drag end event by clicking (mocked behavior)
    act(() => {
      fireEvent.click(dndContext);
    });

    await waitFor(() => {
      expect(userDashboardApi.updateSettings).toHaveBeenCalledWith('mock-token', {
        widgets: expect.arrayContaining([
          expect.objectContaining({ id: 'recentSales', order: 0 }),
          expect.objectContaining({ id: 'salesByMonthChart', order: 1 }),
          expect.objectContaining({ id: 'topSellingProductsChart', order: 2 }),
          expect.objectContaining({ id: 'loyaltyPoints', order: 3 }),
          expect.objectContaining({ id: 'totalSales', order: 4 }),
        ]),
      });
    });
  });

  it('should save widget settings and show a success toast', async () => {
    // Mock the ManageWidgetsModal to directly call onSave
    vi.mock('../components/Dashboard/ManageWidgetsModal', () => ({
      __esModule: true,
      default: ({ isOpen, onClose, widgets, onSave }: any) => {
        if (!isOpen) return null;
        return (
          <div role="dialog" aria-label="Gerenciar Widgets">
            <button onClick={() => onSave([
              { id: 'totalSales', title: 'Vendas Totais', visible: false, order: 0 },
              { id: 'salesByMonthChart', title: 'Vendas por Mês', visible: true, order: 1 },
              { id: 'topSellingProductsChart', title: 'Produtos Mais Vendidos', visible: true, order: 2 },
              { id: 'loyaltyPoints', title: 'Pontos de Fidelidade', visible: true, order: 3 },
              { id: 'recentSales', title: 'Vendas Recentes', visible: true, order: 4 },
            ])}>Salvar</button>
            <button onClick={onClose}>Fechar</button>
          </div>
        );
      },
    }));

    const { getByText } = render(<DashboardPage />);

    await screen.findByText('Vendas Totais');

    // Open the manage widgets modal
    act(() => {
      getByText('Gerenciar Widgets').click();
    });

    // Click the mocked save button
    act(() => {
      getByText('Salvar').click();
    });

    await waitFor(() => {
      expect(userDashboardApi.updateSettings).toHaveBeenCalledWith('mock-token', {
        widgets: expect.arrayContaining([
          expect.objectContaining({ id: 'totalSales', visible: false, order: 0 }),
          expect.objectContaining({ id: 'salesByMonthChart', visible: true, order: 1 }),
        ]),
      });
      expect(addToastMock).toHaveBeenCalledWith('Configurações do dashboard salvas com sucesso!', 'success');
    });
  });
});
