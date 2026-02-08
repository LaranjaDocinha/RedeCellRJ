import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PurchaseSuggestionPage from './PurchaseSuggestionPage';
import api from '../../services/api';
import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme();

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn()
  }
}));

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('PurchaseSuggestionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load and display purchase suggestions correctly', async () => {
    const mockData = [
      { 
        productId: 1, 
        productName: 'iPhone 15 Case', 
        currentStock: 5, 
        avgWeeklyConsumption: 14, 
        daysOfCover: 2, 
        suggestedQuantity: 20, 
        classification: 'A' 
      }
    ];

    (api.get as any).mockResolvedValueOnce({ data: mockData });

    renderWithTheme(<PurchaseSuggestionPage />);

    await waitFor(() => {
      expect(screen.getByText(/Inteligência de Reposição/i)).toBeDefined();
      expect(screen.getByText(/iPhone 15 Case/i)).toBeDefined();
    });

    // Check for critical alert (2 days of cover)
    expect(screen.getByText(/2 dias/i)).toBeDefined();
    
    // Check for ABC Badge
    expect(screen.getAllByText('A')).toBeDefined();
    
    // Check for suggested quantity
    expect(screen.getByText(/\+ 20 un/i)).toBeDefined();
  });

  it('should display empty state when no suggestions are returned', async () => {
    (api.get as any).mockResolvedValueOnce({ data: [] });

    renderWithTheme(<PurchaseSuggestionPage />);

    await waitFor(() => {
      expect(screen.getByText(/Seu estoque está otimizado/i)).toBeDefined();
    });
  });
});
