import type { Meta, StoryObj } from '@storybook/react';
import { ProductReviews } from '../components/ProductReviews';

const meta = {
  title: 'Components/ProductReviews',
  component: ProductReviews,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ProductReviews>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};