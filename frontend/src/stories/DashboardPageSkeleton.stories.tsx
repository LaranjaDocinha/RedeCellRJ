import type { Meta, StoryObj } from '@storybook/react';
import DashboardPageSkeleton from '../components/Dashboard/DashboardPageSkeleton';

const meta: Meta<typeof DashboardPageSkeleton> = {
  title: 'Skeletons/DashboardPageSkeleton',
  component: DashboardPageSkeleton,
  tags: ['autodocs'],
  parameters: {
      layout: 'fullscreen',
  }
};

export default meta;
type Story = StoryObj<typeof DashboardPageSkeleton>;

export const Default: Story = {};
