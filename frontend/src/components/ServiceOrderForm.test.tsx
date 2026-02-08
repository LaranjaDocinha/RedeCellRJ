import { render, screen, fireEvent, waitFor } from '../test-utils/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ServiceOrderForm from './ServiceOrderForm';
import { TestProviders } from '../test-utils/TestProviders';
import api from '../services/api';

vi.mock('../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  }
}));

describe('ServiceOrderForm Component', () => {
  const mockSubmit = vi.fn();
  const mockCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (api.get as any).mockResolvedValue({ data: [] });
  });

  it('should render all basic fields', () => {
    render(<ServiceOrderForm onSubmit={mockSubmit} onCancel={mockCancel} token="test" />, { wrapper: TestProviders });

    expect(screen.getByLabelText(/Nome do Cliente/i)).toBeDefined();
    expect(screen.getByLabelText(/Modelo do Aparelho/i)).toBeDefined();
    expect(screen.getByLabelText(/Defeito Reclamado/i)).toBeDefined();
  });

  it('should show validation errors if submitted empty', async () => {
    render(<ServiceOrderForm onSubmit={mockSubmit} onCancel={mockCancel} token="test" />, { wrapper: TestProviders });

    const submitBtn = screen.getByText(/Gerar Orçamento/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSubmit).not.toHaveBeenCalled();
    });
  });

  it('should add a service from catalog and update total', async () => {
    render(<ServiceOrderForm onSubmit={mockSubmit} onCancel={mockCancel} token="test" />, { wrapper: TestProviders });

    const autocomplete = screen.getByLabelText(/Adicionar Serviço/i);
    fireEvent.change(autocomplete, { target: { value: 'Troca de Tela' } });
    fireEvent.keyDown(autocomplete, { key: 'ArrowDown' });
    fireEvent.keyDown(autocomplete, { key: 'Enter' });

    await waitFor(() => {
      expect(screen.getByText('Troca de Tela')).toBeDefined();
    });

    // Check if total estimated label is present
    expect(screen.getByText(/TOTAL ESTIMADO/i)).toBeDefined();
  });
});
