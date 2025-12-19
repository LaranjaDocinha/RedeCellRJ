import type { Meta, StoryObj } from '@storybook/react';
import ActivityFeed from '../components/ActivityFeed';
import { AuthProvider } from '../contexts/AuthContext';

const mockFeed = [
  {
    id: 1,
    activity_type: 'sale',
    user_name: 'João',
    created_at: new Date().toISOString(),
    activity_data: { totalAmount: 1500.00 }
  },
  {
    id: 2,
    activity_type: 'repair_completed',
    user_name: 'Maria',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    activity_data: { productDescription: 'iPhone 13 Tela' }
  },
  {
    id: 3,
    activity_type: 'goal_achieved',
    user_name: 'Carlos',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    activity_data: { goalName: 'Vendas Mensais', badgeName: 'Vendedor Ouro' }
  }
];

const meta: Meta<typeof ActivityFeed> = {
  title: 'Components/ActivityFeed',
  component: ActivityFeed,
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockFeed),
        })
      ) as any;

      return (
        <AuthProvider>
          <Story />
        </AuthProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof ActivityFeed>;

export const Default: Story = {};
