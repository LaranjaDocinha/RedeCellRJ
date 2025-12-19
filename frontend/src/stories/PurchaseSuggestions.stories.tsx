import type { Meta, StoryObj } from '@storybook/react';
import PurchaseSuggestions from '../components/PurchaseSuggestions';
import { AuthProvider } from '../contexts/AuthContext';

const mockSuggestions = [
  { product_id: 1, product_name: 'Capa iPhone 13' },
  { product_id: 2, product_name: 'Película de Vidro' },
];

const meta: Meta<typeof PurchaseSuggestions> = {
  title: 'Components/Product/PurchaseSuggestions',
  component: PurchaseSuggestions,
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      global.fetch = jest.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockSuggestions),
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
type Story = StoryObj<typeof PurchaseSuggestions>;

export const Default: Story = {
  args: {
    customerId: 123,
  },
};
