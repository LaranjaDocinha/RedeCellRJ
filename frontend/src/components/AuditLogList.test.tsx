import { render, screen, fireEvent } from '../test-utils/test-utils';
import { describe, it, expect, vi } from 'vitest';
import { AuditLogList } from './AuditLogList';
import { TestProviders } from '../test-utils/TestProviders';

// Mock do DiffViewer para focar no List
vi.mock('./AuditLogDiffViewer', () => ({
  AuditLogDiffViewer: () => <div data-testid="diff-viewer">Diff Viewer</div>
}));

describe('AuditLogList Component', () => {
  const mockLogs = [
    {
      id: 1,
      action: 'create',
      entity_type: 'product',
      entity_id: '123',
      user_email: 'admin@test.com',
      timestamp: new Date().toISOString(),
      hash: 'abc123456789',
      details: {},
      old_values: null,
      new_values: { name: 'iPhone' }
    }
  ];

  it('should render empty state message when no logs', () => {
    render(<AuditLogList logs={[]} />, { wrapper: TestProviders });
    expect(screen.getByText(/Nenhum log de auditoria encontrado/i)).toBeDefined();
  });

  it('should render table rows with log data', () => {
    render(<AuditLogList logs={mockLogs as any} />, { wrapper: TestProviders });
    expect(screen.getByText('admin@test.com')).toBeDefined();
    expect(screen.getByText('CREATE')).toBeDefined();
    expect(screen.getByText('product')).toBeDefined();
  });

  it('should expand row to show details on click', async () => {
    render(<AuditLogList logs={mockLogs as any} />, { wrapper: TestProviders });
    
    const row = screen.getByText('admin@test.com');
    fireEvent.click(row);

    expect(screen.getByText(/DETALHES DA ALTERAÇÃO/i)).toBeDefined();
    expect(screen.getByTestId('diff-viewer')).toBeDefined();
  });
});
