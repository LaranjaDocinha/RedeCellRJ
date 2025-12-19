import type { Meta, StoryObj } from '@storybook/react';
import SalesHeatmapWidget from '../components/Dashboard/SalesHeatmapWidget';

const meta: Meta<typeof SalesHeatmapWidget> = {
  title: 'Dashboard/Widgets/SalesHeatmapWidget',
  component: SalesHeatmapWidget,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SalesHeatmapWidget>;

export const Default: Story = {
  args: {
    data: [
      { city: 'Rio de Janeiro', sales_count: 150, total_revenue: 45000 },
      { city: 'Niterói', sales_count: 80, total_revenue: 22000 },
      { city: 'Nova Iguaçu', sales_count: 45, total_revenue: 12000 },
    ],
  },
};
