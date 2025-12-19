import type { Meta, StoryObj } from '@storybook/react';
import Leaderboard from '../components/gamification/Leaderboard';
import { AuthProvider } from '../contexts/AuthContext';

const mockData = [
    { id: 1, name: 'João Silva', total: 50000 },
    { id: 2, name: 'Maria Souza', total: 42000 },
    { id: 3, name: 'Pedro Santos', total: 35000 },
];

const meta: Meta<typeof Leaderboard> = {
  title: 'Gamification/Leaderboard',
  component: Leaderboard,
  tags: ['autodocs'],
  decorators: [
    (Story) => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
              ok: true,
              json: () => Promise.resolve(mockData),
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
type Story = StoryObj<typeof Leaderboard>;

export const Default: Story = {};
