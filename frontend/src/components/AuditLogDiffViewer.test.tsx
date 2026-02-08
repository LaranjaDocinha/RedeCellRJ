import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AuditLogDiffViewer } from './AuditLogDiffViewer';
import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme();

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('AuditLogDiffViewer', () => {
  it('should render diff between oldValues and newValues correctly', () => {
    const oldValues = { name: 'Produto Antigo', price: 100 };
    const newValues = { name: 'Produto Novo', price: 150 };

    renderWithTheme(<AuditLogDiffViewer oldValues={oldValues} newValues={newValues} />);

    expect(screen.getByText(/NAME/i)).toBeDefined();
    expect(screen.getByText(/Produto Antigo/i)).toBeDefined();
    expect(screen.getByText(/Produto Novo/i)).toBeDefined();
    
    expect(screen.getByText(/PRICE/i)).toBeDefined();
    expect(screen.getByText(/100/i)).toBeDefined();
    expect(screen.getByText(/150/i)).toBeDefined();
  });

  it('should render creation state when only newValues are provided', () => {
    const newValues = { name: 'Novo Item', sku: 'ABC-123' };

    renderWithTheme(<AuditLogDiffViewer newValues={newValues} />);

    expect(screen.getByText(/ESTADO INICIAL:/i)).toBeDefined();
    expect(screen.getByText(/"name": "Novo Item"/i)).toBeDefined();
  });

  it('should fallback to legacy details if no robust values are provided', () => {
    const details = {
      diff: {
        field_test: { from: 'A', to: 'B' }
      }
    };

    renderWithTheme(<AuditLogDiffViewer details={details} />);

    expect(screen.getByText(/FIELD TEST/i)).toBeDefined();
    expect(screen.getByText(/A/i)).toBeDefined();
    expect(screen.getByText(/B/i)).toBeDefined();
  });
});
