import type { Meta, StoryObj } from '@storybook/react';
import MyGoals from '../components/gamification/MyGoals';
import { AuthProvider } from '../contexts/AuthContext';

const mockGoals = [
    { goal: { id: 1, name: 'Meta de Janeiro', target_value: 10000 }, achieved_value: 7500, progress: 75 },
    { goal: { id: 2, name: 'Venda de Acessórios', target_value: 50 }, achieved_value: 10, progress: 20 },
];

const meta: Meta<typeof MyGoals> = {
  title: 'Gamification/MyGoals',
  component: MyGoals,
  tags: ['autodocs'],
  decorators: [
    (Story) => {
        global.fetch = jest.fn(() =>
            Promise.resolve({
              ok: true,
              json: () => Promise.resolve(mockGoals),
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
type Story = StoryObj<typeof MyGoals>;

export const Default: Story = {};
