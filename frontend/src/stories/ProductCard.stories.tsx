import type { Meta, StoryObj } from '@storybook/react';
import { ProductCard } from '../components/ProductCard';

const meta = {
  title: 'Components/ProductCard',
  component: ProductCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    imageUrl: { control: 'text', description: 'URL da imagem do produto.' },
    name: { control: 'text', description: 'Nome do produto.' },
    price: { control: 'number', description: 'Preço do produto.' },
    rating: { control: 'number', description: 'Avaliação do produto (0 a 5).' },
    onAddToCart: { action: 'added to cart', description: 'Função chamada ao clicar no botão.' },
  },
} satisfies Meta<typeof ProductCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    imageUrl: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692845702708',
    name: 'iPhone 15 Pro Max',
    price: 9299.99,
    rating: 4.8,
  },
};

export const OutOfStock: Story = {
    args: {
      imageUrl: 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium?wid=5120&hei=2880&fmt=p-jpg&qlt=80&.v=1692845702708',
      name: 'iPhone 15 Pro Max',
      price: 9299.99,
      rating: 4.8,
      // disabled: true, // This would be a good prop to add later
    },
  };