import { render, screen, fireEvent, waitFor } from '../../test-utils/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProductForm from './ProductForm';
import { TestProviders } from '../../test-utils/TestProviders';
import api from '../../services/api';

// Mock centralizado para evitar loops e problemas de contexto
vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  }
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ token: 'mock-token', user: { id: '1' } }),
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

vi.mock('../../contexts/NotificationContext', () => ({
  useNotification: () => ({ addNotification: vi.fn() }),
  NotificationProvider: ({ children }: any) => <>{children}</>,
}));

// Mock do serviço para evitar chamadas reais
vi.mock('../../services/productService', () => ({
  fetchProductById: vi.fn(),
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
}));

describe('ProductForm Component', () => {
  const mockBranches = [{ id: 1, name: 'Matriz' }];
  const mockCategories = [{ id: 1, name: 'Celulares' }];
  const mockSuppliers = [{ id: 1, name: 'Fornecedor A' }];

  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockImplementation((url: string) => {
      if (url.includes('/api/branches')) return Promise.resolve({ data: mockBranches });
      if (url.includes('/api/categories')) return Promise.resolve({ data: mockCategories });
      if (url.includes('/api/suppliers')) return Promise.resolve({ data: mockSuppliers });
      return Promise.resolve({ data: [] });
    });
  });

  it('should render identification fields', async () => {
    render(<ProductForm />, { wrapper: TestProviders });

    // Espera o loading sumir
    await waitFor(() => {
      expect(screen.queryByRole('progressbar')).toBeNull();
    });

    expect(screen.getByLabelText(/Nome do Produto/i)).toBeDefined();
    expect(screen.getByLabelText(/SKU Base/i)).toBeDefined();
  });

  it('should add a variation when clicking add button', async () => {
    render(<ProductForm />, { wrapper: TestProviders });

    await waitFor(() => expect(screen.queryByRole('progressbar')).toBeNull());

    const addBtn = screen.getByText(/Adicionar/i);
    fireEvent.click(addBtn);

    // Deve ter 2 campos de SKU variação agora
    const skuFields = screen.getAllByLabelText(/SKU Variação/i);
    expect(skuFields.length).toBe(2);
  });
});
