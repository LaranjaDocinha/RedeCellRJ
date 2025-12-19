import type { Meta, StoryObj } from '@storybook/react';
import DashboardWidgetSkeleton from '../components/Dashboard/DashboardWidgetSkeleton';

const meta: Meta<typeof DashboardWidgetSkeleton> = {
  title: 'Skeletons/DashboardWidgetSkeleton',
  component: DashboardWidgetSkeleton,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof DashboardWidgetSkeleton>;

export const Default: Story = {};
