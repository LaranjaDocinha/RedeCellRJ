import type { Meta, StoryObj } from '@storybook/react';
import MyBadges from '../components/gamification/MyBadges';
import { AuthProvider } from '../contexts/AuthContext';

const mockBadges = [
    { id: 1, name: 'Vendedor Iniciante', description: 'Realizou a primeira venda', icon_url: 'https://via.placeholder.com/64' },
    { id: 2, name: 'Mestre em Vendas', description: 'Vendeu mais de R$ 10.000', icon_url: 'https://via.placeholder.com/64' },
];

const meta: Meta<typeof MyBadges> = {
  title: 'Gamification/MyBadges',
  component: MyBadges,
  tags: ['autodocs'],
  decorators: [
    (Story) => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
              ok: true,
              json: () => Promise.resolve(mockBadges),
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
type Story = StoryObj<typeof MyBadges>;

export const Default: Story = {};
