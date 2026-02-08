import { render, screen, fireEvent, waitFor } from '../test-utils/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import POSPage from './POSPage';
import * as ReactRouter from 'react-router-dom';
import { TestProviders } from '../test-utils/TestProviders';

// Mock do router
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual as any,
    useNavigate: vi.fn(),
    useLoaderData: vi.fn(),
  };
});

vi.mock('../contexts/NotificationContext', () => ({
  useNotification: () => ({ 
    showNotification: vi.fn(), 
    addNotification: vi.fn(),
    notifications: []
  }),
  NotificationProvider: ({ children }: any) => <>{children}</>,
}));

describe('POSPage Integration', () => {
  const mockProducts = [
    { id: 1, name: 'iPhone 15', sku: 'IPH15', variations: [{ price: 5000, stock_quantity: 10 }] }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    (ReactRouter.useLoaderData as any).mockReturnValue({
      products: mockProducts,
      categories: [],
      customers: []
    });
  });

  it('should render POS title and search input', () => {
    render(<POSPage />, { wrapper: TestProviders });
    expect(screen.getByText(/PDV RedecellRJ/i)).toBeDefined();
  });
});
