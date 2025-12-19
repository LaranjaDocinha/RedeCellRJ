import type { Meta, StoryObj } from '@storybook/react';
import ActiveChallengesWidget from '../components/gamification/ActiveChallengesWidget';
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

const mockChallenges = [
  {
    id: 1,
    title: 'Venda Rápida',
    description: 'Faça 5 vendas em 1 hora',
    metric: 'sales_count',
    target_value: 5,
    current_value: 3,
    reward_xp: 50,
    completed: false,
    end_date: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Mestre do Reparo',
    description: 'Conclua 3 reparos sem retorno',
    metric: 'repairs_quality',
    target_value: 3,
    current_value: 3,
    reward_xp: 100,
    completed: true,
    end_date: new Date().toISOString(),
  }
];

const meta: Meta<typeof ActiveChallengesWidget> = {
  title: 'Gamification/ActiveChallengesWidget',
  component: ActiveChallengesWidget,
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      mockedAxios.get.mockResolvedValue({ data: mockChallenges });
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
type Story = StoryObj<typeof ActiveChallengesWidget>;

export const Default: Story = {};
