import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ABCAnalysisPage from './ABCAnalysisPage';
import api from '../../services/api';
import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme();

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn()
  }
}));

// Mock ReactApexChart as it causes issues in JSDOM
vi.mock('react-apexcharts', () => ({
  default: () => <div data-testid="mock-apexchart">Chart Mock</div>
}));

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('ABCAnalysisPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should load and display ABC analysis data correctly', async () => {
    const mockData = [
      { productId: 1, productName: 'Item A Gold', revenue: 1000, share: 80, cumulativeShare: 80, classification: 'A' },
      { productId: 2, productName: 'Item B Silver', revenue: 150, share: 12, cumulativeShare: 92, classification: 'B' },
      { productId: 3, productName: 'Item C Bronze', revenue: 50, share: 8, cumulativeShare: 100, classification: 'C' }
    ];

    (api.get as any).mockResolvedValueOnce({ data: mockData });

    renderWithTheme(<ABCAnalysisPage />);

    // Check for loading state (assuming it uses CircularProgress)
    // expect(screen.getByRole('progressbar')).toBeDefined();

    await waitFor(() => {
      expect(screen.getByText(/Análise Curva ABC/i)).toBeDefined();
      expect(screen.getByText(/Item A Gold/i)).toBeDefined();
      expect(screen.getByText(/Item B Silver/i)).toBeDefined();
      expect(screen.getByText(/Item C Bronze/i)).toBeDefined();
    });

    // Check for badges
    expect(screen.getAllByText('A')).toBeDefined();
    expect(screen.getAllByText('B')).toBeDefined();
    expect(screen.getAllByText('C')).toBeDefined();
    
    // Check for revenue formatting
    expect(screen.getByText(/R\$ 1.000/i)).toBeDefined();
  });

  it('should display insights and stats cards', async () => {
    (api.get as any).mockResolvedValueOnce({ data: [] });
    renderWithTheme(<ABCAnalysisPage />);

    await waitFor(() => {
      expect(screen.getByText(/Insight Estratégico/i)).toBeDefined();
      expect(screen.getByText(/Composição do Portfólio/i)).toBeDefined();
    });
  });
});
