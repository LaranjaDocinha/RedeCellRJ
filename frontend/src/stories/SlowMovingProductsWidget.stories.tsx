import type { Meta, StoryObj } from '@storybook/react';
import SlowMovingProductsWidget from '../components/Dashboard/SlowMovingProductsWidget';

const meta: Meta<typeof SlowMovingProductsWidget> = {
  title: 'Dashboard/Widgets/SlowMovingProductsWidget',
  component: SlowMovingProductsWidget,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SlowMovingProductsWidget>;

export const Default: Story = {
  args: {
    data: [
      { name: 'Cabo USB Antigo', color: 'Preto', quantity: 50, days_since_sale: 120 },
      { name: 'Capa iPhone 6', color: 'Rosa', quantity: 12, days_since_sale: 365 },
      { name: 'Carregador Veicular', color: 'Genérico', quantity: 8, days_since_sale: 45 },
    ],
  },
};

export const Empty: Story = {
  args: {
    data: [],
  },
};
