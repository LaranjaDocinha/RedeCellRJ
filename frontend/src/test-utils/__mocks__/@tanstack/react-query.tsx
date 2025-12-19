import React from 'react';
import { vi } from 'vitest';

export const QueryClientProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export const QueryClient = vi.fn().mockImplementation(() => ({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
}));

export const useQuery = vi.fn();
export const useMutation = vi.fn();
export const useQueryClient = vi.fn(() => ({
  invalidateQueries: vi.fn(),
  setQueryData: vi.fn(),
}));
