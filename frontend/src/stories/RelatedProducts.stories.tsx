import type { Meta, StoryObj } from '@storybook/react';
import { RelatedProducts } from '../components/RelatedProducts';

const meta = {
  title: 'Components/RelatedProducts',
  component: RelatedProducts,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof RelatedProducts>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};