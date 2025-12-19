import type { Meta, StoryObj } from '@storybook/react';
import PurchaseSuggestionsWidget from '../components/Dashboard/PurchaseSuggestionsWidget';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';

const mockData = [
  {
    productId: '1',
    productName: 'Cabo USB-C',
    variationId: 101,
    variationColor: 'Branco',
    currentStock: 2,
    predictedDemand: 10,
    suggestedQuantity: 8,
    reason: 'Baixo estoque e alta saída',
  },
  {
    productId: '2',
    productName: 'Película de Vidro',
    variationId: 102,
    variationColor: 'Transparente',
    currentStock: 0,
    predictedDemand: 15,
    suggestedQuantity: 15,
    reason: 'Estoque zerado',
  },
];

const meta: Meta<typeof PurchaseSuggestionsWidget> = {
  title: 'Dashboard/Widgets/PurchaseSuggestionsWidget',
  component: PurchaseSuggestionsWidget,
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
          <NotificationProvider>
            <Story />
          </NotificationProvider>
        </AuthProvider>
      );
    },
  ],
};

export default meta;
type Story = StoryObj<typeof PurchaseSuggestionsWidget>;

export const Default: Story = {};
