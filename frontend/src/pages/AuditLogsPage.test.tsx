import { render, screen, fireEvent, waitFor } from '../test-utils/test-utils';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AuditLogsPage from './AuditLogsPage';
import { TestProviders } from '../test-utils/TestProviders';

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ token: 'mock-token' }),
  AuthProvider: ({ children }: any) => <>{children}</>,
}));

vi.mock('../contexts/NotificationContext', () => ({
  useNotification: () => ({ addNotification: vi.fn() }),
  NotificationProvider: ({ children }: any) => <>{children}</>,
}));

describe('AuditLogsPage Integration', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  const mockLogs = {
    logs: [
      {
        id: 1,
        action: 'update',
        entity_type: 'product',
        entity_id: '1',
        user_email: 'admin@test.com',
        timestamp: new Date().toISOString()
      }
    ],
    totalCount: 1
  };

  it('should render page title and filters', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockLogs)
    });

    render(<AuditLogsPage />, { wrapper: TestProviders });

    expect(screen.getByText(/Logs de Auditoria/i)).toBeDefined();
    expect(screen.getByLabelText(/Tipo de Entidade/i)).toBeDefined();
    
    await waitFor(() => {
      expect(screen.getByText('admin@test.com')).toBeDefined();
    });
  });

  it('should update filters and clear them', async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockLogs)
    });

    render(<AuditLogsPage />, { wrapper: TestProviders });

    const entityInput = screen.getByLabelText(/Tipo de Entidade/i);
    fireEvent.change(entityInput, { target: { value: 'customer' } });
    expect((entityInput as HTMLInputElement).value).toBe('customer');

    const clearBtn = screen.getByText(/Limpar Filtros/i);
    fireEvent.click(clearBtn);

    expect((entityInput as HTMLInputElement).value).toBe('');
  });
});
