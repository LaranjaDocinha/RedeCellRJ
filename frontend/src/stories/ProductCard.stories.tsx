import type { Meta, StoryObj } from '@storybook/react';
import { ProductCard } from '../components/ProductCard';
import { BrowserRouter } from 'react-router-dom';

const meta = {
  title: 'Components/ProductCard',
  component: ProductCard,
  decorators: [
    (Story) => (
      <BrowserRouter>
        <div style={{ maxWidth: '300px' }}>
          <Story />
        </div>
      </BrowserRouter>
    ),
  ],
  tags: ['autodocs'],
  argTypes: {
    onAddToCart: { action: 'added to cart' },
    onQuickView: { action: 'quick view clicked' },
    onEdit: { action: 'edit clicked' },
  },
} satisfies Meta<typeof ProductCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    id: 1,
    name: 'Smartphone Galaxy S23',
    imageUrl: 'https://placehold.co/300x300',
    price: 4999.90,
    rating: 4.5,
  },
};

export const LowStock: Story = {
  args: {
    id: 2,
    name: 'Carregador Turbo',
    imageUrl: 'https://placehold.co/300x300',
    price: 150.00,
    rating: 5,
    // Assuming the component handles stock visualization if prop passed, or we simulate by name context
  },
};
