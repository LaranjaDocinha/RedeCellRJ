import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SystemHealthPage from './SystemHealthPage';
import axios from 'axios';
import { ThemeProvider, createTheme } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const theme = createTheme();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

vi.mock('axios');

// Mock ReactApexChart
vi.mock('react-apexcharts', () => ({
  default: () => <div data-testid="mock-apexchart">Chart Mock</div>
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        {ui}
      </ThemeProvider>
    </QueryClientProvider>
  );
};

describe('SystemHealthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('should load and display external services resilience data', async () => {
    const mockHealth = { services: { database: 'connected' } };
    const mockServicesHealth = {
      status: 'healthy',
      services: [
        { 
          name: 'WhatsApp Delivery', 
          opened: false, 
          stats: { successes: 100, failures: 0 } 
        },
        { 
          name: 'Pix Generation', 
          opened: true, 
          stats: { successes: 50, failures: 10 } 
        }
      ]
    };

    (axios.get as any).mockImplementation((url: string) => {
      if (url === '/api/health') return Promise.resolve({ data: mockHealth });
      if (url === '/api/v1/health/services') return Promise.resolve({ data: mockServicesHealth });
      return Promise.reject(new Error('Not found'));
    });

    renderWithProviders(<SystemHealthPage />);

    await waitFor(() => {
      expect(screen.getByText(/WhatsApp Delivery/i)).toBeDefined();
      expect(screen.getByText(/Pix Generation/i)).toBeDefined();
    });

    // Check status display
    expect(screen.getByText(/CLOSED \(HEALTHY\)/i)).toBeDefined();
    expect(screen.getByText(/OPEN \(PROTECTED\)/i)).toBeDefined();
    
    // Check stats
    expect(screen.getByText('100')).toBeDefined(); // Successes
    expect(screen.getByText('10')).toBeDefined(); // Failures
  });
});
