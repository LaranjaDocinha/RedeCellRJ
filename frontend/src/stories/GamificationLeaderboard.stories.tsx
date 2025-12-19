import type { Meta, StoryObj } from '@storybook/react';
import GamificationLeaderboard from '../components/gamification/GamificationLeaderboard';
import { AuthProvider } from '../contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: false,
        },
    },
});

const mockLeaderboard = [
  { id: 1, name: 'João Silva', email: 'joao@example.com', total: 15000, xp: 1200, level: 5 },
  { id: 2, name: 'Maria Souza', email: 'maria@example.com', total: 12000, xp: 900, level: 4 },
  { id: 3, name: 'Carlos Santos', email: 'carlos@example.com', total: 10000, xp: 800, level: 3 },
  { id: 4, name: 'Ana Oliveira', email: 'ana@example.com', total: 8000, xp: 600, level: 2 },
];

const meta: Meta<typeof GamificationLeaderboard> = {
  title: 'Gamification/GamificationLeaderboard',
  component: GamificationLeaderboard,
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      mockedAxios.get.mockResolvedValue({ data: mockLeaderboard });
      return (
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Story />
          </AuthProvider>
        </QueryClientProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof GamificationLeaderboard>;

export const Default: Story = {};
