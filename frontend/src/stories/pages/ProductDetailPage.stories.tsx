import type { Meta, StoryObj } from '@storybook/react';
import ProductDetailPage from '../../pages/ProductDetailPage';

const meta = {
  title: 'Pages/ProductDetailPage',
  component: ProductDetailPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ProductDetailPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
