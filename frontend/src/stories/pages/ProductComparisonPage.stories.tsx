import type { Meta, StoryObj } from '@storybook/react';
import ProductComparisonPage from '../../pages/ProductComparisonPage';

const meta = {
  title: 'Pages/ProductComparisonPage',
  component: ProductComparisonPage,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ProductComparisonPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
